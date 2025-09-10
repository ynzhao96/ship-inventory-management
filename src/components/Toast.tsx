import { useEffect } from "react";

const Toast = ({
  open,
  message,
  onClose,
  duration = 2000,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}) => {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none">
      <div
        role="status"
        aria-live="polite"
        className={[
          "mt-4 max-w-sm w-[90%] rounded-lg bg-white text-gray-700 shadow-lg dark:bg-neutral-800 dark:border-neutral-700 pointer-events-auto",
          "px-4 py-2 flex items-center gap-3",
          "transform transition-all duration-300 ease-out",
          open ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0",
        ].join(" ")}
      >
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

export default Toast;