import { FC, useEffect } from 'react';
import { Alert } from '@skedulo/breeze-ui-react';

export interface ToastItem {
  id: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  timeout?: number;
}

interface ToastProps extends ToastItem {
  onClose: (id: string) => void;
}

export const Toast: FC<ToastProps> = ({ id, type = 'info', message, timeout = 4000, onClose }) => {
  useEffect(() => {
    // const t = setTimeout(() => onClose(id), timeout);
    // return () => clearTimeout(t);
  }, [id, timeout, onClose]);

  return (
    <div className="tw-shadow-lg tw-rounded tw-overflow-hidden tw-w-72 tw-bg-white tw-p-4">
      <Alert
        type={'success'}
        clearable
        onClear={() => onClose(id)}
      >
        {message}
      </Alert>
    </div>
  );
};
