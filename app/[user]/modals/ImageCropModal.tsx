import React, { useCallback, useRef } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Image from "next/image";
import Modal from "@/components/shared/Modal";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  isProfilePicture?: boolean;
}

const centerAspectCrop = (
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) =>
  centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  isProfilePicture = false,
}: ImageCropModalProps) {
  const [crop, setCrop] = React.useState<Crop>();
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop | null>(
    null
  );
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    },
    [aspectRatio]
  );

  const getCroppedImg = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop) => {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width * scaleX * 2;
      canvas.height = crop.height * scaleY * 2;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (isProfilePicture) {
        ctx.globalCompositeOperation = "destination-in";
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      return new Promise<string>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error("Canvas is empty");
              return;
            }
            resolve(URL.createObjectURL(blob));
          },
          "image/png",
          1
        );
      });
    },
    [isProfilePicture]
  );

  const handleCropComplete = useCallback(async () => {
    if (imgRef.current && completedCrop) {
      const croppedImageUrl = await getCroppedImg(
        imgRef.current,
        completedCrop
      );
      if (croppedImageUrl) {
        onCropComplete(croppedImageUrl);
        onClose();
      }
    }
  }, [completedCrop, getCroppedImg, onCropComplete, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop Image" className="">
      <div className="space-y-4">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspectRatio}
          circularCrop={isProfilePicture}
        >
          <Image
            ref={imgRef as any}
            src={imageSrc}
            alt="Crop me"
            width={300}
            height={300}
            onLoad={onImageLoad}
          />
        </ReactCrop>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-kairo-black-a40 text-kairo-white rounded hover:bg-kairo-black-a20"
          >
            Cancel
          </button>
          <button
            onClick={handleCropComplete}
            className="px-4 py-2 bg-kairo-green font-semibold text-kairo-black rounded hover:bg-kairo-green-a80"
          >
            Crop
          </button>
        </div>
      </div>
    </Modal>
  );
}
