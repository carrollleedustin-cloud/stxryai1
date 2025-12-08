import { toast as sonnerToast } from 'sonner';
import type { ExternalToast } from 'sonner';

/**
 * Toast notification utility
 * Wrapper around Sonner for consistent toast notifications throughout the app
 */
export const toast = {
  /**
   * Show success toast
   */
  success: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.success(message, {
      description,
      ...options
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.error(message, {
      description,
      ...options
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.info(message, {
      description,
      ...options
    });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.warning(message, {
      description,
      ...options
    });
  },

  /**
   * Show loading toast
   */
  loading: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.loading(message, {
      description,
      ...options
    });
  },

  /**
   * Promise-based toast with loading, success, and error states
   */
  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, msgs);
  },

  /**
   * Custom toast with custom JSX
   */
  custom: (jsx: (id: string | number) => React.ReactElement, options?: ExternalToast) => {
    return sonnerToast.custom(jsx, options);
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    sonnerToast.dismiss();
  }
};

/**
 * Common toast messages
 */
export const toastMessages = {
  saveSuccess: 'Changes saved successfully',
  saveError: 'Failed to save changes',
  deleteSuccess: 'Deleted successfully',
  deleteError: 'Failed to delete',
  copySuccess: 'Copied to clipboard',
  copyError: 'Failed to copy',
  networkError: 'Network error. Please check your connection.',
  unauthorized: 'You need to be logged in to do that',
  permissionDenied: 'You don\'t have permission to do that'
};
