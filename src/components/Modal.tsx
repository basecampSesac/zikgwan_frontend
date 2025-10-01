import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import TicketDetails from "../components/tickets/TicketDetails";

function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function Modal({
  buttonText,
  classes,
}: {
  buttonText: string;
  classes: string;
}) {
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
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            {/* backdrop */}
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            {/* content */}
            <div className="relative bg-white w-96 p-6 rounded-md shadow-lg">
              <TicketDetails />
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
