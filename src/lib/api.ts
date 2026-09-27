import {
  StudySet,
  GenerateOptions,
  ApiError
} from '../types/result';
import { validateStudySet } from './validateResult';

const API_BASE = '/api';
const DEFAULT_TIMEOUT_MS = 35000;

export class ApiRequestError extends Error {
  apiError: ApiError;
  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiRequestError';
    this.apiError = apiError;
  }
}

/**
 * Fetch with explicit timeout helper
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const signal = options.signal || controller.signal;

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal,
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new ApiRequestError({
        type: 'TIMEOUT',
        message: `Request timed out after ${timeoutMs / 1000} seconds. The AI model or server took too long to respond.`,
        canRetry: true,
      });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Calls backend proxy to generate a structured StudySet from user notes or topic.
 */
export async function generateStudySet(
  input: string,
  options?: GenerateOptions,
  signal?: AbortSignal
): Promise<{ studySet: StudySet; warnings?: string[] }> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE}/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input, options }),
        signal,
      },
      DEFAULT_TIMEOUT_MS
    );

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        throw new ApiRequestError({
          type: 'RATE_LIMITED',
          message: responseBody?.message || 'Rate limit reached. Please wait a moment before trying again.',
          canRetry: true,
        });
      }

      if (status === 400) {
        throw new ApiRequestError({
          type: 'INVALID_SCHEMA',
          message: responseBody?.message || 'Invalid input provided.',
          canRetry: false,
        });
      }

      throw new ApiRequestError({
        type: responseBody?.error || 'SERVER_ERROR',
        message: responseBody?.message || `Server error (${status}). Please try again.`,
        details: responseBody?.details,
        rawResponse: responseBody?.rawSnippet,
        canRetry: true,
      });
    }

    if (!responseBody || !responseBody.data) {
      throw new ApiRequestError({
        type: 'EMPTY_RESPONSE',
        message: 'Received empty response body from backend.',
        canRetry: true,
      });
    }

    // Defensive validation on frontend before allowing into UI
    const validation = validateStudySet(responseBody.data);
    if (!validation.isValid) {
      throw new ApiRequestError(validation.error);
    }

    return {
      studySet: validation.data,
      warnings: validation.warnings,
    };
  } catch (error: any) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiRequestError({
        type: 'TIMEOUT',
        message: 'Request was cancelled or timed out.',
        canRetry: true,
      });
    }

    // Network error (server offline / proxy unreachable)
    throw new ApiRequestError({
      type: 'NETWORK_ERROR',
      message: 'Unable to connect to backend server. Make sure the server is running on port 3001.',
      details: error.message,
      canRetry: true,
    });
  }
}

/**
 * Calls backend proxy to refine / modify an existing StudySet with follow-up prompt.
 */
export async function refineStudySet(
  currentStudySet: StudySet,
  instruction: string,
  signal?: AbortSignal
): Promise<{ studySet: StudySet }> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE}/refine`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentStudySet, instruction }),
        signal,
      },
      DEFAULT_TIMEOUT_MS
    );

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiRequestError({
        type: responseBody?.error || 'SERVER_ERROR',
        message: responseBody?.message || 'Failed to refine study set.',
        canRetry: true,
      });
    }

    const validation = validateStudySet(responseBody?.data);
    if (!validation.isValid) {
      throw new ApiRequestError(validation.error);
    }

    return {
      studySet: validation.data,
    };
  } catch (error: any) {
    if (error instanceof ApiRequestError) throw error;
    throw new ApiRequestError({
      type: 'SERVER_ERROR',
      message: error.message || 'Error communicating with refinement service.',
      canRetry: true,
    });
  }
}

/**
 * Checks backend health and configuration status.
 */
export async function checkBackendHealth(): Promise<{
  status: string;
  llmConfigured: boolean;
  provider: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return {
      status: 'offline',
      llmConfigured: false,
      provider: 'Offline / Standalone Fallback',
    };
  }
}
