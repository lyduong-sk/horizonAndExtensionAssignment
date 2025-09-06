import { FC, useEffect } from 'react';
import { Alert } from '@skedulo/breeze-ui-react';

export interface IToastItem {
  id: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  timeout?: number;
}

interface IToastProps extends IToastItem {
  onClose: (id: string) => void;
}

export const Toast: FC<IToastProps> = ({ id, type = 'info', message, timeout = 4000, onClose }) => {

  /* Auto clear toast */
  useEffect(() => {
    const toastTimeout = setTimeout(() => onClose(id), timeout);
    return () => clearTimeout(toastTimeout);
  }, [id, timeout, onClose]);

  /* Render */
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
