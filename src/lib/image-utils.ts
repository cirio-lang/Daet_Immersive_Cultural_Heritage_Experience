export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ResizeImageResult {
  file: File;
  wasResized: boolean;
  originalDimensions: ImageDimensions;
  newDimensions: ImageDimensions;
}

/**
 * Checks if a file is an Apple HEIC or HEIF image based on MIME type or file extension.
 */
export function isHeicFile(file: File): boolean {
  if (!file) return false;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return type === "image/heic" || type === "image/heif" || name.endsWith(".heic") || name.endsWith(".heif");
}

/**
 * Converts an Apple HEIC/HEIF file into a standard web-compatible JPEG File in the browser.
 * If the file is already a JPEG, PNG, WebP, etc., it is returned directly without alteration.
 */
export async function convertHeicToJpeg(file: File, quality = 0.92): Promise<File> {
  if (!isHeicFile(file)) {
    return file;
  }

  if (typeof window === "undefined") {
    return file;
  }

  try {
    const heic2any = (await import("heic2any")).default;
    const conversionResult = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality,
    });

    const resultBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
    const baseName = file.name.replace(/\.(heic|heif)$/i, "");
    const newFileName = `${baseName}.jpg`;

    return new File([resultBlob], newFileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("HEIC conversion error:", error);
    throw new Error(
      `Failed to convert Apple HEIC image "${file.name}". Please convert it to JPG/PNG before uploading.`,
    );
  }
}

/**
 * Reads the natural pixel dimensions of an image File.
 * Automatically converts HEIC to JPEG first if required.
 */
export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  const readyFile = isHeicFile(file) ? await convertHeicToJpeg(file) : file;

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(readyFile);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          `Failed to load image "${readyFile.name}" (${(readyFile.size / (1024 * 1024)).toFixed(2)} MB). The file may be corrupt, truncated, or in an unsupported format.`,
        ),
      );
    };

    img.src = objectUrl;
  });
}

/**
 * Resizes an image file if its dimensions exceed maxWidth or maxHeight.
 * For equirectangular panoramas, preserves aspect ratio and outputs JPEG.
 * Automatically converts HEIC files to standard JPEG first.
 */
export async function resizeImageIfNeeded(
  file: File,
  maxWidth = 8192,
  maxHeight = 4096,
  quality = 0.95,
): Promise<ResizeImageResult> {
  const processedFile = isHeicFile(file) ? await convertHeicToJpeg(file) : file;
  const originalDimensions = await getImageDimensions(processedFile);
  const { width, height } = originalDimensions;

  // If already within bounds, return processed file (which is JPEG if original was HEIC)
  if (width <= maxWidth && height <= maxHeight) {
    return {
      file: processedFile,
      wasResized: processedFile !== file,
      originalDimensions,
      newDimensions: originalDimensions,
    };
  }

  // Calculate target dimensions maintaining aspect ratio
  const scale = Math.min(maxWidth / width, maxHeight / height);
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(processedFile);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Unable to create canvas context for image resizing."));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error("Failed to export resized image blob."));
              return;
            }

            const baseName = processedFile.name.replace(/\.[^/.]+$/, "");
            const newFileName = `${baseName}-resized.jpg`;
            const resizedFile = new File([blob], newFileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve({
              file: resizedFile,
              wasResized: true,
              originalDimensions,
              newDimensions: {
                width: targetWidth,
                height: targetHeight,
              },
            });
          },
          "image/jpeg",
          quality,
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err instanceof Error ? err : new Error("Failed to process image resizing."));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          `Failed to load image "${processedFile.name}" (${(processedFile.size / (1024 * 1024)).toFixed(2)} MB) into canvas for resizing.`,
        ),
      );
    };

    img.src = objectUrl;
  });
}
