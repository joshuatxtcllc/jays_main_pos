
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"
import {
  useToast as useToastOriginal,
} from "@/components/ui/use-toast"

export interface ToastOptions extends ToastProps {
  title?: string
  description?: string
  action?: ToastActionElement
}

export const useToast = useToastOriginal;

// Export the toast function properly
export const toast = (options: ToastOptions) => {
  const { toast } = useToastOriginal();
  return toast(options);
};

export type { Toast };
