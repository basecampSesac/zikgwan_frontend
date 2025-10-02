import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { ReactNode } from "react"; // ✅ 타입 전용 import 추가

function ModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

interface ModalProps {
  buttonText: string;
  classes: string;
  children?: ReactNode;
}

export default function Modal({ buttonText, classes, children }: ModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={classes} onClick={() => setOpen(true)}>
        {buttonText}
      </button>

      {open && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
          >
            {/* backdrop */}
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            {/* content */}
            <div className="relative bg-white w-[500px] max-w-full p-6 rounded-md shadow-lg">
              {children ?? <div />}
              <button
                className="absolute top-2 right-2 text-neutral-500 hover:text-neutral-800"
                onClick={() => setOpen(false)}
                aria-label="닫기"
              >
                <X />
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
