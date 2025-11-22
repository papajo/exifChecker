import { AnalyzedImage } from "./types";

export const DEMO_IMAGES: AnalyzedImage[] = [
  {
    id: 'demo-1',
    url: 'https://picsum.photos/id/250/800/1000',
    status: 'complete',
    exif: {
      camera: 'Fujifilm X-T4',
      lens: 'XF 35mm f/1.4 R',
      aperture: 'f/1.4',
      shutterSpeed: '1/2000s',
      iso: 'ISO 200',
      focalLength: '35mm',
      description: 'A beautifully composed shot with shallow depth of field, likely taken with a prime lens to isolate the subject against a soft background.'
    }
  },
  {
    id: 'demo-2',
    url: 'https://picsum.photos/id/13/800/1000',
    status: 'complete',
    exif: {
        camera: 'Sony A7R V',
        lens: 'FE 24-70mm GM II',
        aperture: 'f/8',
        shutterSpeed: '1/250s',
        iso: 'ISO 100',
        focalLength: '24mm',
        description: 'High dynamic range landscape photography capturing fine texture details in the sand and sky.'
    }
  },
  {
    id: 'demo-3',
    url: 'https://picsum.photos/id/64/800/1000',
    status: 'complete',
    exif: {
        camera: 'Leica Q2',
        lens: 'Summilux 28mm f/1.7 ASPH',
        aperture: 'f/2.8',
        shutterSpeed: '1/60s',
        iso: 'ISO 800',
        focalLength: '28mm',
        description: 'Moody portrait lighting with cool tones, suggesting evening or indoor natural light photography.'
    }
  }
];