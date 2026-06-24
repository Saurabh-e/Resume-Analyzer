export const Skeleton = ({ className = '', width, height, circle = false }) => {
  return (
    <div
      className={`skeleton ${circle ? 'rounded-full' : ''} ${className}`}
      style={{ width, height }}
    />
  );
};

export const SkeletonCard = () => (
  <div className="card-premium p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton circle width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton height={20} className="w-3/4" />
        <Skeleton height={16} className="w-1/2" />
      </div>
    </div>
    <Skeleton height={100} className="w-full" />
    <div className="flex gap-2">
      <Skeleton height={32} className="w-20" />
      <Skeleton height={32} className="w-24" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton circle width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} className="w-full" />
          <Skeleton height={14} className="w-2/3" />
        </div>
        <Skeleton height={32} className="w-24" />
      </div>
    ))}
  </div>
);

export default Skeleton;
