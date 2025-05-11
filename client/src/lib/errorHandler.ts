import { toast } from '@/hooks/use-toast';
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

// Main error handler function
export function handleError(error: any, context?: string): ErrorDetails {
  console.error(`Error in ${context || 'application'}:`, error);
  
  let errorDetails: ErrorDetails = {
    type: ErrorType.UNKNOWN,
    message: 'An unknown error occurred',
    originalError: error
  };
  
  // Handle network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('Network') || error?.message?.includes('Failed to fetch')) {
    errorDetails = {
      type: ErrorType.NETWORK,
      message: 'Network connection error. Please check your internet connection.',
      originalError: error
    };
  }
  // Handle timeout errors
  else if (error?.name === 'TimeoutError' || error?.message?.includes('timeout') || error?.code === 'ETIMEDOUT' || error?.code === 'ESOCKETTIMEDOUT') {
    errorDetails = {
      type: ErrorType.TIMEOUT,
      message: 'Request timed out. Please try again later.',
      originalError: error
    };
  } 
  // Handle authentication errors
  else if (error?.status === 401 || error?.response?.status === 401) {
    errorDetails = {
      type: ErrorType.AUTHENTICATION,
      message: 'Authentication error. Please log in again.',
      originalError: error
    };
    
    // Redirect to login page if needed
    // window.location.href = '/login';
  } 
  // Handle authorization errors
  else if (error?.status === 403 || error?.response?.status === 403) {
    errorDetails = {
      type: ErrorType.AUTHORIZATION,
      message: 'You do not have permission to perform this action.',
      originalError: error
    };
  } 
  // Handle validation errors
  else if (error?.status === 422 || error?.response?.status === 422 || error?.name === 'ValidationError') {
    errorDetails = {
      type: ErrorType.VALIDATION,
      message: error.message || 'Validation error. Please check your input.',
      originalError: error
    };
  } 
  // Handle not found errors
  else if (error?.status === 404 || error?.response?.status === 404) {
    errorDetails = {
      type: ErrorType.NOT_FOUND,
      message: 'The requested resource was not found.',
      originalError: error
    };
  } 
  // Handle server errors
  else if (error?.status >= 500 || error?.response?.status >= 500) {
    errorDetails = {
      type: ErrorType.SERVER,
      message: 'Server error. Please try again later.',
      originalError: error
    };
  } 
  // Handle database errors
  else if (error?.message?.includes('database') || error?.message?.includes('SQL')) {
    errorDetails = {
      type: ErrorType.DATABASE,
      message: 'Database error. Please try again later.',
      originalError: error
    };
  }
  // Handle image processing errors
  else if (
    error?.message?.includes('image') || 
    error?.message?.includes('canvas') || 
    error?.message?.includes('data URL') ||
    error?.name === 'ImageError'
  ) {
    errorDetails = {
      type: ErrorType.VALIDATION,
      message: 'Error processing image. Please try a different image or format.',
      code: 'IMAGE_PROCESSING_ERROR',
      originalError: error
    };
  }
  
  return errorDetails;
}

// Display error toast with appropriate message
export function displayErrorToast(error: any, context?: string) {
  const errorDetails = handleError(error, context);
  
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