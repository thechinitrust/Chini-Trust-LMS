export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * Crops an image based on pixel coordinates and returns a compressed WebP Blob.
 * Automatically resizes if the cropped area is larger than 1920px wide to ensure
 * high performance and low storage/bandwidth overhead.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  maxWidth = 1920
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not initialize 2D canvas context");
  }

  // Calculate target dimensions, scaling down if wider than maxWidth
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;

  if (targetWidth > maxWidth) {
    const scale = maxWidth / targetWidth;
    targetWidth = maxWidth;
    targetHeight = Math.round(targetHeight * scale);
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export to Blob failed"));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      0.88
    );
  });
}
