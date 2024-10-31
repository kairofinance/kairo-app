export default function ContentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-kairo-black-a20 rounded w-1/4 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-kairo-black-a20 rounded w-3/4" />
        <div className="h-4 bg-kairo-black-a20 rounded w-1/2" />
        <div className="h-4 bg-kairo-black-a20 rounded w-5/6" />
      </div>
    </div>
  );
}
