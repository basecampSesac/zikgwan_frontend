import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  onClose,
  onConfirm,
  children,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        {/* 제목 */}
        <h2 className="text-xl font-bold mb-2 text-center">{title}</h2>

        {/* 설명 (줄바꿈 가능) */}
        <p className="text-sm text-gray-600 text-center mb-6 whitespace-pre-line">
          {description}
        </p>

        {children && <div className="mb-4">{children}</div>}
        {/* 버튼 (중앙 정렬) */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
