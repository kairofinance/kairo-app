"use client";

import { useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { XCircleIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { useAlert } from "@/hooks/useAlert";
import AlertMessage from "@/components/AlertMessage";
import ContactList from "./components/ContactList";
import AddContactModal from "./components/AddContactModal";

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

interface Contact {
  id: string;
  name: string;
  address: string;
}

export default function ContactsClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address } = useAppKitAccount();
  const { alertState, showAlert, dismissAlert } = useAlert();
  const [localContacts, setLocalContacts] = useState<Contact[]>([]);

  const { refetch: refetchContacts } = useQuery({
    queryKey: ["contacts", address],
    queryFn: async () => {
      if (!address) return [];
      const response = await fetch(`/api/contacts?address=${address}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      setLocalContacts(data.contacts || []);
      return data.contacts;
    },
    enabled: !!address,
  });

  const handleAddContact = async (contactData: {
    name: string;
    address: string;
  }) => {
    // Optimistically add the contact
    const tempId = `temp-${Date.now()}`;
    const newContact = {
      id: tempId,
      name: contactData.name,
      address: contactData.address,
    };

    setLocalContacts((prev) => [...prev, newContact]);
    setIsModalOpen(false);
    showAlert("Adding contact... This may take a few moments.", "success");

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactData.name,
          address: contactData.address,
          userAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add contact");
      }

      showAlert("Contact added successfully!", "success");
      await refetchContacts();
    } catch (error) {
      // Remove the temporary contact if the request fails
      setLocalContacts((prev) => prev.filter((c) => c.id !== tempId));
      showAlert("Failed to add contact", "error");
    }
  };

  const handleContactDelete = async (contactId: string) => {
    showAlert("Deleting contact... This may take a few moments.", "success");
    try {
      await refetchContacts();
    } catch (error) {
      showAlert("Failed to delete contact", "error");
    }
  };

  const handleContactEdit = async () => {
    showAlert("Updating contact... This may take a few moments.", "success");
    try {
      await refetchContacts();
    } catch (error) {
      showAlert("Failed to update contact", "error");
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
            <XCircleIcon className="mx-auto h-12 w-12 text-orange-600" />
            <h3 className="mt-2 text-lg font-medium text-white">
              Wallet Not Connected
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Please connect your wallet to view your contacts
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={fadeInVariant}
          custom={0}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Address Book</h1>
              <p className="mt-2 text-sm text-white/60">
                Manage your saved addresses and contacts
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Add Contact
            </button>
          </div>

          {/* Contact List */}
          <ContactList
            contacts={localContacts}
            onRefetch={refetchContacts}
            onDelete={handleContactDelete}
            onEdit={handleContactEdit}
          />

          {/* Add Contact Modal */}
          <AddContactModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleAddContact}
          />

          {/* Alert */}
          {alertState && (
            <AlertMessage
              message={alertState.message}
              type={alertState.type}
              onDismiss={dismissAlert}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
