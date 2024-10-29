import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
} from "@heroicons/react/20/solid";

interface Feature1Props {
  dictionary: any;
}

export default function Feature1({ dictionary }: Feature1Props) {
  const t = dictionary.feature1 || {};

  const features = [
    {
      name: t.boostYield || "Boost yield anywhere",
      description:
        t.boostYieldDescription ||
        "Use Grove tokens across lending protocols, liquidity pools, and staking platforms to maximize your yield. With Grove, you can easily take advantage of the best opportunities in the DeFi ecosystem, boosting your overall returns and optimizing your investment strategy.",
      href: "#",
      icon: CloudArrowUpIcon,
    },
    {
      name: t.saferExposure || "Safer exposure",
      description:
        t.saferExposureDescription ||
        "Grove tokens offer diversified exposure to multiple high-quality assets, reducing the risk of individual asset volatility. This approach ensures robust yields and a more stable, secure investment in the DeFi landscape.",
      href: "#",
      icon: LockClosedIcon,
    },
    {
      name: t.simpleQueues || "Simple queues",
      description:
        t.simpleQueuesDescription ||
        "Pellentesque sit elit congue ante nec amet. Dolor aenean curabitur viverra suspendisse iaculis eget. Nec mollis placerat ultricies euismod ut condimentum.",
      href: "#",
      icon: ArrowPathIcon,
    },
  ];

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-red-600 dark:text-kairo-green-a20">
            {t.forSmartInvestor || "For the smart investor"}
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-kairo-black-a20 dark:text-kairo-white sm:text-4xl">
            {t.simplifyJourney || "Simplify Your DeFi Journey"}
          </p>
          <p className="mt-6 text-lg leading-8 text-kairo-black-a40 dark:text-zinc-200">
            {t.description ||
              "Grove tokens are designed to give you access to diversified, yield-bearing assets with minimal effort. By holding our tokens, you gain exposure to a wide range of DeFi opportunities, including lending, staking, and liquidity provision."}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-kairo-black-a20 dark:text-kairo-white">
                  <feature.icon
                    aria-hidden="true"
                    className="h-5 w-5 flex-none text-kairo-green dark:text-kairo-green-a20"
                  />
                  {feature.name}
                </dt>
                <div className="mt-4 flex flex-auto flex-col text-base leading-7 text-kairo-black-a40 dark:text-zinc-300">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a
                      href={feature.href}
                      className="text-sm font-semibold leading-6 text-red-700 dark:text-kairo-green-a20 hover:text-red-600 dark:hover:text-kairo-green-a80"
                    >
                      {t.learnMore || "Learn more"}{" "}
                      <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
