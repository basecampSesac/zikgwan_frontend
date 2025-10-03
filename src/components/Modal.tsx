import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ReactNode } from "react";
function ModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        {/* Content */}
        <div className="relative bg-white w-[500px] max-w-full p-6 rounded-md shadow-lg">
          {children}
          <button
            className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-800"
            onClick={onClose}
            aria-label="닫기"
          >
            <X />
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
