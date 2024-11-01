"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppKitAccount } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { XCircleIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { useAlert } from "@/hooks/useAlert";
import AlertMessage from "@/components/AlertMessage";
import Spinner from "@/components/Spinner";
import ContactList from "./components/ContactList";
import AddContactModal from "./components/AddContactModal";

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
      <div className="min-h-screen bg-kairo-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-xl bg-kairo-black-a20/40 p-8 backdrop-blur-sm text-center">
            <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-lg font-medium text-kairo-white">
              Wallet Not Connected
            </h3>
            <p className="mt-2 text-sm text-kairo-white/70">
              Please connect your wallet to view your contacts
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kairo-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-kairo-white">Contacts</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-kairo-green bg-kairo-green-a20 bg-opacity-30 rounded-lg hover:bg-kairo-green/20 transition-colors duration-200"
          >
            <UserPlusIcon className="h-5 w-5" />
            Add Contact
          </button>
        </div>

        <ContactList
          contacts={localContacts}
          onRefetch={refetchContacts}
          onDelete={handleContactDelete}
          onEdit={handleContactEdit}
        />

        <AddContactModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAddContact}
        />

        {alertState && (
          <AlertMessage
            message={alertState.message}
            type={alertState.type}
            onDismiss={dismissAlert}
          />
        )}
      </div>
    </div>
  );
}
