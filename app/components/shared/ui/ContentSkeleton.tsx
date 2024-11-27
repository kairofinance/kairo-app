interface ContentSkeletonProps {
  className?: string;
}

const ContentSkeleton: React.FC<ContentSkeletonProps> = ({ className }) => {
  return (
    <div
      className={`animate-pulse bg-kairo-black-a20/40 rounded-lg ${
        className || ""
      }`}
    />
  );
};

export default ContentSkeleton;
