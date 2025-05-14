import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// Error types to handle specific cases
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  DATABASE = 'database',
  TIMEOUT = 'timeout',
  IMAGE_PROCESSING = 'image_processing',
  UNKNOWN = 'unknown'
}

interface ErrorDetails {
  type: ErrorType;
  message: string;
  code?: string;
  path?: string;
  originalError?: any;
}

// Handle and normalize different error types
function handleError(error: any, context?: string): ErrorDetails {
  console.error(`Error ${context ? `in ${context}` : ''}:`, error);

  // Network error
  if (error.name === 'AxiosError' && !error.response) {
    return {
      type: ErrorType.NETWORK,
      message: 'Unable to connect to the server. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      originalError: error
    };
  }

  // Server errors (500 range)
  if (error.response && error.response.status >= 500) {
    return {
      type: ErrorType.SERVER,
      message: 'The server encountered an error. Please try again later.',
      code: `SERVER_${error.response.status}`,
      originalError: error
    };
  }

  // Authentication errors (401)
  if (error.response && error.response.status === 401) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: 'You need to be logged in to perform this action.',
      code: 'UNAUTHENTICATED',
      originalError: error
    };
  }

  // Authorization errors (403)
  if (error.response && error.response.status === 403) {
    return {
      type: ErrorType.AUTHORIZATION,
      message: 'You do not have permission to perform this action.',
      code: 'UNAUTHORIZED',
      originalError: error
    };
  }

  // Not found errors (404)
  if (error.response && error.response.status === 404) {
    return {
      type: ErrorType.NOT_FOUND,
      message: 'The requested resource was not found.',
      code: 'NOT_FOUND',
      originalError: error
    };
  }

  // Validation errors (400, 422)
  if (error.response && (error.response.status === 400 || error.response.status === 422)) {
    return {
      type: ErrorType.VALIDATION,
      message: error.response.data?.message || 'The submitted data is invalid.',
      code: 'VALIDATION_ERROR',
      originalError: error
    };
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
    return {
      type: ErrorType.TIMEOUT,
      message: 'The request took too long to complete. Please try again.',
      code: 'REQUEST_TIMEOUT',
      originalError: error
    };
  }

  // Image processing errors
  if (error.message && (
    error.message.includes('image') || 
    error.message.includes('file') || 
    error.message.includes('upload')
  )) {
    return {
      type: ErrorType.IMAGE_PROCESSING,
      message: 'There was a problem processing your image. Please try again with a different file.',
      code: 'IMAGE_PROCESSING_ERROR',
      originalError: error
    };
  }

  return {
    type: ErrorType.UNKNOWN,
    message: error.message || 'An unexpected error occurred.',
    originalError: error
  };
}

// Display error toast with appropriate message
export function displayErrorToast(error: any, context?: string) {
  const errorDetails = handleError(error, context);

  // Get toast from the hook
  const { toast } = useToast();

  toast({
    title: getErrorTitle(errorDetails.type),
    description: errorDetails.message,
    variant: "destructive",
  });

  return errorDetails;
}

// Get appropriate error title based on error type
function getErrorTitle(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Network Error';
    case ErrorType.AUTHENTICATION:
      return 'Authentication Error';
    case ErrorType.AUTHORIZATION:
      return 'Permission Denied';
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    case ErrorType.SERVER:
      return 'Server Error';
    case ErrorType.DATABASE:
      return 'Database Error';
    case ErrorType.TIMEOUT:
      return 'Request Timeout';
    case ErrorType.IMAGE_PROCESSING:
      return 'Image Processing Error';
    case ErrorType.UNKNOWN:
    default:
      return 'Error';
  }
}

// Centralized retry logic for API calls with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: string
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed for ${context || 'operation'}:`, error);
      lastError = error;
      
      // Don't retry certain error types
      const errorDetails = handleError(error, context);
      if (
        errorDetails.type === ErrorType.AUTHORIZATION ||
        errorDetails.type === ErrorType.VALIDATION ||
        errorDetails.type === ErrorType.NOT_FOUND
      ) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      if (attempt < maxRetries - 1) {
        // Calculate delay with exponential backoff and some jitter
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.3 * exponentialDelay; // Add up to 30% jitter
        const totalDelay = exponentialDelay + jitter;
        
        console.log(`Retrying in ${Math.round(totalDelay)}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError;
}

// Function to handle specific form validation errors
export function handleFormErrors(errors: Record<string, any>, setError: any) {
  Object.entries(errors).forEach(([field, error]) => {
    setError(field, {
      type: 'manual',
      message: error?.message || 'Invalid input'
    });
  });
}

// Error boundary helper
export function logErrorToServer(error: Error, componentStack: string) {
  // In a real app, this would send the error to your server or a service like Sentry
  console.error('Error logged to server:', { error, componentStack });
}

// Global error event listener
export function setupGlobalErrorHandling() {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Don't display toast for every error to avoid overwhelming the user
    // Only log it for now
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Don't display toast for every rejection to avoid overwhelming the user
    // Only log it for now
  });
}