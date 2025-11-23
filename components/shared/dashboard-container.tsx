import { cn } from '@/lib/utils';

type DashboardContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function DashboardContainer({
  children,
  className,
}: DashboardContainerProps) {
  return (
    <div className={cn(className, 'space-y-6 md:p-6 p-0')}>{children}</div>
  );
}
