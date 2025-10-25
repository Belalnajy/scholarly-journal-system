interface Stat {
    value: string;
    label: string;
  }
  
  interface StatsProps {
    stats: Stat[];
  }
  
  export function Stats({ stats }: StatsProps) {
    return (
      <div className="flex items-center justify-end gap-20" dir="rtl">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-end">
            <div className="flex h-12 flex-col justify-center text-[#b2823e]">
              <p className="text-center">{stat.value}</p>
            </div>
            <p className="text-[#b3b3b3]">{stat.label}</p>
          </div>
        ))}
      </div>
    );
  }
  