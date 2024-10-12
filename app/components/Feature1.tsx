import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
} from "@heroicons/react/20/solid";

const features = [
  {
    name: "Boost yield anywhere",
    description:
      "Use Grove tokens across lending protocols, liquidity pools, and staking platforms to maximize your yield. With Grove, you can easily take advantage of the best opportunities in the DeFi ecosystem, boosting your overall returns and optimizing your investment strategy.",
    href: "#",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Safer exposure",
    description:
      "Grove tokens offer diversified exposure to multiple high-quality assets, reducing the risk of individual asset volatility. This approach ensures robust yields and a more stable, secure investment in the DeFi landscape.",
    href: "#",
    icon: LockClosedIcon,
  },
  {
    name: "Simple queues",
    description:
      "Pellentesque sit elit congue ante nec amet. Dolor aenean curabitur viverra suspendisse iaculis eget. Nec mollis placerat ultricies euismod ut condimentum.",
    href: "#",
    icon: ArrowPathIcon,
  },
];

export default function Feature1() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-red-600">
            For the smart investor
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simplify Your DeFi Journey
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Grove tokens are designed to give you access to diversified,
            yield-bearing assets with minimal effort. By holding our tokens, you
            gain exposure to a wide range of DeFi opportunities, including
            lending, staking, and liquidity provision.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon
                    aria-hidden="true"
                    className="h-5 w-5 flex-none text-red-500"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a
                      href={feature.href}
                      className="text-sm font-semibold leading-6 text-red-700"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
