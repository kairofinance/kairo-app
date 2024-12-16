import { put } from "@vercel/blob";

export const blobToFile = async (
  blobUrl: string,
  fileName: string
): Promise<File> => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type });
};

export const dataURLtoFile = (dataUrl: string, fileName: string): File => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new File([u8arr], fileName, { type: mime });
};

export const isDataURL = (str: string): boolean => {
  const regex =
    /^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i;
  return regex.test(str);
};

export async function uploadImageToVercelBlob(file: File): Promise<string> {
  // Use the put method to upload the file
  const { url } = await put(`uploads/${file.name}`, file, {
    access: "public",
  });

  // Directly use the correct Vercel Blob Storage domain
  const formattedUrl = url.replace(
    /^https:\/\/[^/]+/,
    "https://pspn4pqflsrqqzjp.public.blob.vercel-storage.com"
  );

  return formattedUrl; // Return the public URL of the uploaded image
}
