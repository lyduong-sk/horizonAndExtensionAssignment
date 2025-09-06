import React, { ReactPortal } from 'react'
import { createPortal } from 'react-dom'
import { Toast, IToastItem } from './index'

interface IToastContainerProps {
  toasts: IToastItem[];
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: IToastContainerProps): ReactPortal | null => {

  if (!toasts.length) return null

  // @ts-ignore
  return createPortal(
    <div
      className="tw-fixed tw-top-0 tw-right-0 tw-flex tw-flex-col tw-gap-3 tw-z-50"
      role="status"
      aria-live="polite"
    >
      {toasts.map(t => (
        <Toast key={t.id} {...t} onClose={onRemove} />
      ))}
    </div>,
    document.body
  )
}
