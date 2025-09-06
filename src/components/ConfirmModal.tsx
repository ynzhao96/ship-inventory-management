// src/components/ConfirmModal.tsx
import React from "react";
import Modal from "./Modal";

type ConfirmModalProps = {
  open: boolean;
  title?: React.ReactNode;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = "请确认",
  message,
  confirmText = "确认",
  cancelText = "取消",
  onConfirm,
  onCancel,
}) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    footer={
      <>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {confirmText}
        </button>
      </>
    }
  >
    {message && <p>{message}</p>}
  </Modal>
);

export default ConfirmModal;