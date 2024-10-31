import React from "react";

function Invoice() {
  return (
    <div className="mx-auto flex place-items-center">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-kairo-black-a20 bg-opacity-30 px-4 py-10 shadow sm:px-12 rounded-lg">
          <form action="#" method="POST" className="space-y-6">
            <div>
              <label className="block text-sm font-medium leading-6 text-kairo-white">
                You pay
              </label>
              <div className="mt-2">
                <input
                  required
                  className="block w-full border-0 py-1.5 text-kairo-white bg-kairo-black-a20 bg-opacity-60 shadow-sm ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-kairo-green sm:text-sm sm:leading-6 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-kairo-white"
              >
                You receive
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-lg border-0 py-1.5 text-kairo-white bg-kairo-black-a20 bg-opacity-60 shadow-sm ring-1 ring-inset ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-kairo-green sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center text-kairo-green bg-kairo-green-a20 bg-opacity-30 px-3 py-3 text-sm font-semibold shadow-lg hover:bg-kairo-green/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kairo-green rounded-lg"
              >
                Connect Wallet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
