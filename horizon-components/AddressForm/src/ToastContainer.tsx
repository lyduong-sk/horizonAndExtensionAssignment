import { FC } from 'react';
import { createPortal } from 'react-dom';
import { Toast, ToastItem } from './Toast';

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const ToastContainer: FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

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
  );
};
