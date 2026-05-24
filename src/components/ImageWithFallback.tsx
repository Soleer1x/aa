import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallback = 'https://via.placeholder.com/400x300?text=Imagem+Indisponível',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    setImgSrc(fallback);
  };

  return <img src={imgSrc} alt={alt} onError={handleError} {...props} />;
};
