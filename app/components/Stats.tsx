interface StatsProps {
  dictionary: any;
}

export default function Stats({ dictionary }: StatsProps) {
  const t = dictionary.stats || {};

  const stats = [
    {
      id: 1,
      name: t.transactions24h || "Transactions every 24 hours",
      value: t.transactionsValue || "44 million",
    },
    {
      id: 2,
      name: t.assetsHolding || "Assets under holding",
      value: t.assetsValue || "$119 trillion",
    },
    {
      id: 3,
      name: t.newUsers || "New users annually",
      value: t.newUsersValue || "46,000",
    },
  ];

  return (
    <div className="py-24 sm:py-32 ">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="mx-auto flex max-w-xs flex-col gap-y-4"
            >
              <dt className="text-base leading-7 text-kairo-black-a40 text-zinc-300">
                {stat.name}
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-kairo-black-a20 text-kairo-white sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
