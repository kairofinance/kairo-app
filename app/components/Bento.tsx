import Image from "next/image";

export default function Bento() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-center text-base/7 font-semibold text-kairo-green">
          Deploy faster
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-pretty text-center text-4xl font-medium tracking-tight text-zinc-950 dark:text-kairo-white sm:text-5xl">
          Everything you need to manage your billing.
        </p>
        <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
          <div className="relative lg:row-span-2">
            <div className="absolute inset-px rounded-lg bg-kairo-white dark:bg-zinc-800 lg:rounded-l-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
              <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-zinc-950 dark:text-kairo-white max-lg:text-center">
                  Mobile friendly
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-kairo-black-a40 dark:text-zinc-200 max-lg:text-center">
                  Use Kairo on any device. Fund management has never been so
                  user-focused.
                </p>
              </div>
              <div className="relative min-h-[30rem] w-full grow [container-type:inline-size] max-lg:mx-auto max-lg:max-w-sm">
                <div className="absolute inset-x-10 bottom-0 top-10 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-zinc-700 bg-kairo-black-a20 shadow-2xl">
                  <Image
                    src="https://tailwindui.com/plus/img/component-images/bento-03-mobile-friendly.png"
                    alt="Mobile friendly interface"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem]"></div>
          </div>
          <div className="relative max-lg:row-start-1">
            <div className="absolute inset-px rounded-lg bg-kairo-white dark:bg-zinc-800 max-lg:rounded-t-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-zinc-950 dark:text-kairo-white max-lg:text-center">
                  Performance
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-kairo-black-a40 dark:text-zinc-200 max-lg:text-center">
                  Lorem ipsum, dolor sit amet consectetur adipisicing elit
                  maiores impedit.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2">
                <Image
                  src="https://tailwindui.com/plus/img/component-images/bento-03-performance.png"
                  alt="Performance chart"
                  width={500}
                  height={300}
                  layout="responsive"
                />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem]"></div>
          </div>
          <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
            <div className="absolute inset-px rounded-lg bg-kairo-white dark:bg-zinc-800"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-zinc-950 dark:text-kairo-white max-lg:text-center">
                  Security
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-kairo-black-a40 dark:text-zinc-200 max-lg:text-center">
                  Kairo has been professionally audited, and is listed on
                  Immunefi. All eyes on deck to keep your funds secure.
                </p>
              </div>
              <div className="flex flex-1 items-center [container-type:inline-size] max-lg:py-6 lg:pb-2">
                <Image
                  src="https://tailwindui.com/plus/img/component-images/bento-03-security.png"
                  alt="Security features"
                  width={500}
                  height={300}
                  layout="responsive"
                />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5"></div>
          </div>
          <div className="relative lg:row-span-2">
            <div className="absolute inset-px rounded-lg bg-kairo-white dark:bg-zinc-800 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <div className="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
                <p className="mt-2 text-lg/7 font-medium tracking-tight text-zinc-950 dark:text-kairo-white max-lg:text-center">
                  Safe Integration
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-kairo-black-a40 dark:text-zinc-200 max-lg:text-center">
                  Kairo is integrated with Gnosis Safe, making DAO payments
                  easy.
                </p>
              </div>
              <div className="relative min-h-[30rem] w-full grow">
                <div className="absolute bottom-0 left-10 right-0 top-10 overflow-hidden rounded-tl-xl bg-kairo-black-a20 shadow-2xl">
                  <div className="flex bg-zinc-800/40 ring-1 ring-white/5">
                    <Image
                      src="/safe.png"
                      alt="Safe integration"
                      width={500}
                      height={300}
                      layout="responsive"
                    />
                  </div>
                  <div className="px-6 pb-14 pt-6">
                    {/* Your code example */}
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
