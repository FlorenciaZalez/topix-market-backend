/**
 * Compress and resize images before uploading
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  maxSizeMB: 0.5, // 500KB
};

/**
 * Compress an image file to reduce its size
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Error reading file'));

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Error loading image'));

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if compressed size is acceptable
            const sizeMB = blob.size / 1024 / 1024;
            if (sizeMB > opts.maxSizeMB && opts.quality > 0.5) {
              // Try again with lower quality
              compressImage(file, { ...opts, quality: opts.quality - 0.1 })
                .then(resolve)
                .catch(reject);
              return;
            }

            // Create new file from blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
              { type: 'image/webp' }
            );

            resolve(compressedFile);
          },
          'image/webp',
          opts.quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple image files
 */
export async function compressImages(files: File[], options: CompressOptions = {}): Promise<File[]> {
  const promises = files.map((file) => {
    // Only compress image files
    if (!file.type.startsWith('image/')) {
      return Promise.resolve(file);
    }
    return compressImage(file, options);
  });

  return Promise.all(promises);
}

/**
 * Compress category images (smaller size, icons)
 */
export async function compressCategoryImage(file: File): Promise<File> {
  return compressImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.85,
    maxSizeMB: 0.1, // 100KB max
  });
}

/**
 * Compress product images (medium size)
 */
export async function compressProductImage(file: File): Promise<File> {
  return compressImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.85,
    maxSizeMB: 0.5, // 500KB max
  });
}

/**
 * Compress hero/banner images (larger size, high quality)
 */
export async function compressHeroImage(file: File): Promise<File> {
  return compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.9,
    maxSizeMB: 1, // 1MB max
  });
}
