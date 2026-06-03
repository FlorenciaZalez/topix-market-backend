import { type ImgHTMLAttributes, useEffect, useState } from 'react';

import { normalizeAssetUrl } from 'api/client';

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

const defaultFallbackSrc = '/placeholder-topix.svg';

export function SafeImage({ src, fallbackSrc = defaultFallbackSrc, onError, ...props }: SafeImageProps) {
  const resolvedSrc = normalizeAssetUrl(src) ?? fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);

  useEffect(() => {
    setCurrentSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    <img
      {...props}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }

        onError?.(event);
      }}
    />
  );
}