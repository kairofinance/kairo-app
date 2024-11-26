"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

interface CircularCropModalProps {
  imageUrl: string;
  onCrop: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function CircularCropModal({
  imageUrl,
  onCrop,
  onCancel,
}: CircularCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Function to get the cropped image
  const getCroppedImg = async (
    image: HTMLImageElement,
    pixelCrop: PixelCrop
  ): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to match the desired crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw circular crop
    ctx.beginPath();
    ctx.arc(
      pixelCrop.width / 2,
      pixelCrop.height / 2,
      Math.min(pixelCrop.width, pixelCrop.height) / 2,
      0,
      2 * Math.PI
    );
    ctx.clip();

    // Draw the image
    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        1
      );
    });
  };

  const handleApplyCrop = async () => {
    if (!imgRef.current || !completedCrop) return;
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      onCrop(croppedBlob);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="relative max-w-2xl w-full bg-black border border-white/10 rounded-lg p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Crop Image</h3>
            <button
              onClick={onCancel}
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Crop Area */}
          <div className="relative bg-white/[0.02] rounded-lg border border-white/10 overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              className="flex items-center justify-center"
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop preview"
                className="max-h-[500px] object-contain"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const minSize = Math.min(img.width, img.height);
                  setCrop({
                    unit: "%",
                    width: 90,
                    height: 90,
                    x: 5,
                    y: 5,
                  });
                }}
              />
            </ReactCrop>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-white/60 
                       hover:text-white/80 bg-white/[0.02] hover:bg-white/[0.04]
                       rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyCrop}
              disabled={!completedCrop}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                       text-emerald-500 hover:text-emerald-400 
                       bg-emerald-500/10 hover:bg-emerald-500/20
                       rounded-lg transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckIcon className="w-4 h-4" />
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
