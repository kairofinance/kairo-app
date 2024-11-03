export interface Stat {
  name: string;
  value: string | number;
  changeType?: "increase" | "decrease";
  change?: string;
  previousValue?: string | number;
}

interface StatsProps {
  stats: Stat[];
}

export default function Stats({ stats }: StatsProps) {
  return (
    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-kairo-black-a20/40 px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <div className="absolute rounded-md bg-orange-600/10 p-3">
              {/* Icon can be added here if needed */}
            </div>
            <p className="ml-16 truncate text-sm font-medium text-kairo-white/70">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-kairo-white">
              {stat.value}
            </p>
            {stat.change && (
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === "increase"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.changeType === "increase" ? "+" : "-"}
                {stat.change}
              </p>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
