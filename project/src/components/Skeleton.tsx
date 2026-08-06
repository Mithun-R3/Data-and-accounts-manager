interface Props {
  className?: string;
}

export function Skeleton({ className = '' }: Props) {
  return <div className={`bg-white/5 animate-pulse rounded-lg ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="w-6 h-6 rounded-full" />
      </div>
    </div>
  );
}
