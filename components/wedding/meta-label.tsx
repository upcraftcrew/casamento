import { cn } from "@/lib/utils";

type MetaLabelProps = {
  className?: string;
  children: React.ReactNode;
};

export default function MetaLabel({ className, children }: MetaLabelProps) {
  return (
    <span className={cn("meta-label inline-flex items-center gap-2", className)}>
      {children}
    </span>
  );
}
