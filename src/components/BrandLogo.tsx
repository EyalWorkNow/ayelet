import React from 'react';

type BrandTone = 'dark' | 'light' | 'pink';

const brandMarkByTone: Record<BrandTone, string> = {
  dark: '/brand/ayelet-mark-dark.svg',
  light: '/brand/ayelet-mark-light.svg',
  pink: '/brand/ayelet-mark-pink.svg',
};

interface BrandMarkProps {
  tone?: BrandTone;
  className?: string;
  alt?: string;
}

interface BrandLockupProps {
  tone?: BrandTone;
  className?: string;
  markClassName?: string;
  markFrameClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  title?: string;
  subtitle?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  tone = 'dark',
  className = '',
  alt = 'Ayelet Netanel Studio logo',
}) => (
  <img
    src={brandMarkByTone[tone]}
    alt={alt}
    className={className}
    loading="eager"
    decoding="async"
  />
);

export const BrandLockup: React.FC<BrandLockupProps> = ({
  tone = 'dark',
  className = '',
  markClassName = '',
  markFrameClassName = '',
  titleClassName = '',
  subtitleClassName = '',
  title = 'AYELET',
  subtitle = 'NETANEL STUDIO',
}) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className={`flex shrink-0 items-center justify-center ${markFrameClassName}`}>
      <BrandMark tone={tone} className={markClassName} />
    </div>
    <div>
      <div className={titleClassName}>{title}</div>
      <div className={subtitleClassName}>{subtitle}</div>
    </div>
  </div>
);
