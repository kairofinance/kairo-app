import { Dialog } from "@headlessui/react";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  className = "max-w-md",
}: ModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={`mx-auto rounded bg-kairo-black-a20 p-6 ${className}`}
        >
          {title && (
            <Dialog.Title className="text-lg font-semibold text-kairo-white mb-4">
              {title}
            </Dialog.Title>
          )}
          {children}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
