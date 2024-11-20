import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { isAddress } from "viem";
import { useEnsAddress } from "wagmi";
import SpinningLogo from "@/components/SpinningLogo";
import { Fragment } from "react";
import { XCircleIcon } from "@heroicons/react/24/solid";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contactData: { name: string; address: string }) => void;
}

export default function AddContactModal({
  isOpen,
  onClose,
  onSuccess,
}: AddContactModalProps) {
  const [name, setName] = useState("");
  const [addressOrEns, setAddressOrEns] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address: userAddress } = useAppKitAccount();

  const { data: ensAddress, isLoading: isEnsLoading } = useEnsAddress({
    name: addressOrEns.includes(".eth") ? addressOrEns : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress) return;

    setError(null);
    setIsLoading(true);

    try {
      const contactAddress = ensAddress || addressOrEns;

      if (!isAddress(contactAddress)) {
        throw new Error("Invalid Ethereum address");
      }

      if (contactAddress.toLowerCase() === userAddress.toLowerCase()) {
        throw new Error("Cannot add your own address as a contact");
      }

      onSuccess({ name, address: contactAddress });
      setName("");
      setAddressOrEns("");
      setError(null);
    } catch (error: any) {
      console.error("Error adding contact:", error);
      setError(error.message || "Failed to add contact. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          onClose();
          setError(null);
          setName("");
          setAddressOrEns("");
        }}
      >
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
              <Dialog.Panel className="relative overflow-hidden backdrop-blur-sm rounded-lg border border-white/[0.08] bg-white/[0.02] p-6 shadow-xl w-full max-w-sm">
                <Dialog.Title className="text-lg font-semibold leading-7 text-white">
                  Add New Contact
                </Dialog.Title>

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.08]">
                    <div className="flex items-center gap-2 text-orange-600">
                      <XCircleIcon className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-white/60 text-sm font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/90 focus:border-orange-600/20 focus:ring-1 focus:ring-orange-600/20 transition-all duration-200"
                      placeholder="Contact name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/60 text-sm font-medium">
                      Address or ENS
                    </label>
                    <input
                      type="text"
                      value={addressOrEns}
                      onChange={(e) => setAddressOrEns(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/90 focus:border-orange-600/20 focus:ring-1 focus:ring-orange-600/20 transition-all duration-200"
                      placeholder="0x... or ENS"
                      required
                    />
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
                          <span className="ml-2">Adding...</span>
                        </>
                      ) : (
                        "Add Contact"
                      )}
                    </button>
                  </div>
                </form>

                {/* Gradient overlay */}
                <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/[0.02] via-transparent to-transparent opacity-50" />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
