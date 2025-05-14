import { useState, useEffect, useRef, useCallback } from 'react'
import { toast as stateToast, type ToastActionElement } from '@/components/ui/toast'

type ToastProps = {
  id: string
  title?: string
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: 'default' | 'destructive' | 'success'
}

const TOAST_LIMIT = 20
type State = {
  toasts: ToastProps[]
}

let memoryState: State = { toasts: [] }
const listeners: Array<(state: State) => void> = []

export function useToast() {
  const [state, setState] = useState<State>(memoryState)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const toast = useCallback((props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, ...props }
    memoryState = {
      toasts: [...memoryState.toasts, newToast].slice(-TOAST_LIMIT),
    }
    listeners.forEach((listener) => {
      listener(memoryState)
    })
    return id
  }, [])

  return {
    toast,
    toasts: state.toasts,
    dismiss: (toastId?: string) => {
      memoryState = {
        toasts: memoryState.toasts.filter(
          (t) => t.id !== toastId
        ),
      }
      listeners.forEach((listener) => {
        listener(memoryState)
      })
    },
  }
}

export { toast }