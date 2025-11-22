export interface ExifData {
  camera: string;
  lens: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
  focalLength: string;
  description: string;
}

export interface AnalyzedImage {
  id: string;
  url: string;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  exif?: ExifData;
  file?: File;
  error?: string;
}

export interface IconProps {
  className?: string;
}