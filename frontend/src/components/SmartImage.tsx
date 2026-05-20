import { useState } from "react";
import { fallbackImage } from "../lib/images";

interface Props {
  src: string;
  seed: string;
  alt: string;
  size?: number;
  className?: string;
}

export default function SmartImage({ src, seed, alt, size = 80, className = "" }: Props) {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored ? fallbackImage(seed, size) : src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setErrored(true)}
      className={`object-cover bg-panel2 ${className}`}
    />
  );
}
