export async function blobToFile(
  blobUrl: string,
  fileName: string
): Promise<File> {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blobData = await response.blob();
    return new File([blobData], fileName, { type: blobData.type });
  } catch (error) {
    console.error("Error converting blob to file:", error);
    throw error;
  }
}

export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function isDataURL(s: string): boolean {
  return !!s.match(/^data:.*,.*$/);
}
