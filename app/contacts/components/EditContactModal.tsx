import { useState, useEffect } from "react";
import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XCircleIcon } from "@heroicons/react/24/solid";
import Spinner from "@/components/Spinner";
import { isAddress } from "viem";
import { useEnsAddress } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contact: {
    id: string;
    name: string;
    address: string;
  };
}

// Create a typed Dialog component
const Dialog = HeadlessDialog as any;

export default function EditContactModal({
  isOpen,
  onClose,
  onSuccess,
  contact,
}: EditContactModalProps) {
  const [name, setName] = useState(contact.name);
  const [addressOrEns, setAddressOrEns] = useState(contact.address);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address: userAddress } = useAppKitAccount();

  const { data: ensAddress, isLoading: isEnsLoading } = useEnsAddress({
    name: addressOrEns.includes(".eth") ? addressOrEns : undefined,
  });

  useEffect(() => {
    setName(contact.name);
    setAddressOrEns(contact.address);
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const contactAddress = ensAddress || addressOrEns;

      // Validate address
      if (!isAddress(contactAddress)) {
        throw new Error("Invalid Ethereum address");
      }

      // Check if trying to add own address
      if (contactAddress.toLowerCase() === userAddress?.toLowerCase()) {
        throw new Error("Cannot add your own address as a contact");
      }

      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address: contactAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update contact");
      }

      onSuccess();
      setError(null);
    } catch (error: any) {
      console.error("Error updating contact:", error);
      setError(error.message || "Failed to update contact. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              <Dialog.Panel className="relative mx-auto max-w-sm w-full overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm p-6 shadow-xl border border-white/10">
                <Dialog.Title className="text-xl font-semibold text-white mb-6">
                  Edit Contact
                </Dialog.Title>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-black/20 border border-white/5">
                    <div className="flex items-center gap-2 text-orange-600">
                      <XCircleIcon className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-white/60 font-medium text-sm uppercase tracking-wider">
                      Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/20 rounded-lg px-4 py-3 text-white placeholder-white/40 border border-white/10 focus:border-white/20 transition-colors duration-200"
                        placeholder="Contact name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/60 font-medium text-sm uppercase tracking-wider">
                      Address or ENS
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={addressOrEns}
                        onChange={(e) => setAddressOrEns(e.target.value)}
                        className="w-full bg-black/20 rounded-lg px-4 py-3 text-white placeholder-white/40 border border-white/10 focus:border-white/20 transition-colors duration-200"
                        placeholder="0x... or ENS"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || isEnsLoading}
                      className="inline-flex items-center text-sm px-3 py-[5px] rounded-full font-semibold text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
                    >
                      {isLoading || isEnsLoading ? (
                        <>
                          <Spinner inline size={12} />
                          <span className="ml-2">Saving...</span>
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
