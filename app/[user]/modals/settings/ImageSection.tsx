import Image from "next/image";
import React from "react";

interface ImageSectionProps {
  type: "avatar" | "banner";
  currentImage: string;
  onImageClick: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageSection: React.FC<ImageSectionProps> = React.memo(
  ({ type, currentImage, onImageClick, inputRef, onFileChange }) => {
    const isAvatar = type === "avatar";
    const defaultImage = isAvatar
      ? "/default-profile.png"
      : "/default-banner.png";

    // Ensure the image path starts with a slash
    const imageSrc = currentImage?.startsWith("/")
      ? currentImage
      : currentImage?.startsWith("http")
      ? currentImage
      : defaultImage;

    console.log("Rendering ImageSection with imageSrc:", imageSrc);

    return (
      <div className="col-span-full flex items-center gap-x-8">
        {imageSrc && (
          <div className={`relative ${isAvatar ? "w-24 h-24" : "w-48 h-24"}`}>
            <Image
              src={imageSrc}
              alt={type}
              fill
              style={{ objectFit: "cover" }}
              className={isAvatar ? "rounded-full" : "rounded-md"}
            />
          </div>
        )}
        <div>
          <button
            type="button"
            className="rounded-md bg-kairo-white/10 px-3 py-2 text-sm font-semibold text-kairo-white shadow-sm hover:bg-kairo-white/20"
            onClick={onImageClick}
          >
            Change {isAvatar ? "avatar" : "banner"}
          </button>
          <p className="mt-2 text-xs leading-5 text-zinc-400">
            JPG or PNG. 2MB max.
          </p>
          <input
            type="file"
            ref={inputRef}
            onChange={onFileChange}
            className="hidden"
            accept="image/jpeg,image/png"
          />
        </div>
      </div>
    );
  }
);

ImageSection.displayName = "ImageSection";

export default ImageSection;
