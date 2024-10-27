import React, { useState, useCallback, useRef } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog } from "@headlessui/react";
import Image from "next/image";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  isProfilePicture?: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  isProfilePicture = false,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    },
    [aspectRatio]
  );

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop) => {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width * scaleX * 2;
      canvas.height = crop.height * scaleY * 2;

      const ctx = canvas.getContext("2d");

      if (ctx) {
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
      onCropComplete(croppedImageUrl);
      onClose();
    }
  }, [completedCrop, getCroppedImg, onCropComplete, onClose]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-4">
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
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Crop
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImageCropModal;
