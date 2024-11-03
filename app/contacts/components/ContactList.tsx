import { useState, useEffect } from "react";
import { useEnsName } from "wagmi";
import {
  UserCircleIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import EditContactModal from "./EditContactModal";
import Spinner from "@/components/Spinner";

interface Contact {
  id: string;
  name: string;
  address: string;
}

interface ContactListProps {
  contacts: Contact[];
  onRefetch: () => void;
  onDelete: (contactId: string) => void;
  onEdit: () => void;
}

const fadeInVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: custom * 0.1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

const Dialog = HeadlessDialog as any;

function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  contactName,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contactName: string;
  isDeleting: boolean;
}) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative mx-auto max-w-sm w-full overflow-hidden rounded-xl bg-kairo-black-a20/95 backdrop-blur-sm p-6 shadow-xl border border-kairo-black-a40/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-kairo-white">
                      Delete Contact
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-kairo-white/70">
                      Are you sure you want to delete {contactName}? This action
                      cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-kairo-white/70 hover:text-kairo-white transition-colors duration-200"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isDeleting ? (
                      <>
                        <Spinner inline size={12} />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function ContactList({
  contacts,
  onRefetch,
  onDelete,
  onEdit,
}: ContactListProps) {
  const [localContacts, setLocalContacts] = useState(contacts);

  useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  if (!localContacts?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-kairo-white/70">No contacts yet</p>
      </div>
    );
  }

  const handleContactDelete = async (contactId: string) => {
    setLocalContacts((prev) => prev.filter((c) => c.id !== contactId));

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setLocalContacts(contacts);
        throw new Error("Failed to delete contact");
      }

      onDelete(contactId);
      onRefetch();
    } catch (error) {
      console.error("Error deleting contact:", error);
      setLocalContacts(contacts);
    }
  };

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {localContacts.map((contact, index) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onDelete={() => handleContactDelete(contact.id)}
            onRefetch={onRefetch}
            onEdit={onEdit}
            custom={index}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function ContactCard({
  contact,
  onDelete,
  onRefetch,
  onEdit,
  custom,
}: {
  contact: Contact;
  onDelete: () => void;
  onRefetch: () => void;
  onEdit: () => void;
  custom: number;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const { data: ensName } = useEnsName({
    address: contact.address as `0x${string}`,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      setIsDeleted(true);

      await onDelete();

      setTimeout(() => {
        setIsDeleteModalOpen(false);
      }, 300);
    } catch (error) {
      console.error("Error deleting contact:", error);
      setIsDeleted(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        variants={fadeInVariant}
        custom={custom}
        initial="hidden"
        animate={isDeleted ? "exit" : "visible"}
        exit={{
          scale: 0,
          opacity: 0,
          rotate: 10,
          transition: {
            duration: 0.2,
            ease: [0.32, 0, 0.67, 0],
          },
        }}
        layout
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 transition-all duration-200"
      >
        <motion.div
          className="flex flex-col space-y-4"
          animate={
            isDeleted
              ? {
                  scale: [1, 1.05, 0],
                  opacity: [1, 1, 0],
                }
              : {}
          }
          transition={{
            duration: 0.3,
            times: [0, 0.2, 1],
          }}
        >
          {/* Contact Info */}
          <div className="flex items-center gap-4">
            <UserCircleIcon className="h-10 w-10 flex-shrink-0 text-white/20" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-white truncate">
                {contact.name}
              </h3>
              <p className="text-sm text-white/60 truncate">
                {ensName ||
                  `${contact.address.slice(0, 6)}...${contact.address.slice(
                    -4
                  )}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 inline-flex items-center justify-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex-1 inline-flex items-center justify-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>

      <EditContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false);
          onEdit();
          onRefetch();
        }}
        contact={contact}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        contactName={contact.name}
        isDeleting={isDeleting}
      />
    </>
  );
}

export default ContactList;
