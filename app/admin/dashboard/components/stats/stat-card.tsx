import React from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  colorClass,
  bgClass,
  onClick,
}) => {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "rounded-3xl border-none shadow-sm bg-white py-3 px-4 transition-all duration-200",
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">{label}</p>
          <h3 className={cn("text-2xl font-black mt-0.5", colorClass)}>{value}</h3>
        </div>
        <div className={cn("p-2 rounded-xl", bgClass, colorClass)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
};
