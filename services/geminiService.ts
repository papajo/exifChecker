import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExifData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Define the schema for strict JSON output
const exifSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    camera: { type: Type.STRING, description: "Camera body model (e.g., Canon EOS R5, Sony A7IV). If unknown, estimate based on image quality/resolution." },
    lens: { type: Type.STRING, description: "Lens model (e.g., 24-70mm f/2.8). If unknown, estimate focal length class." },
    aperture: { type: Type.STRING, description: "Aperture value (e.g., f/1.8). Estimate based on depth of field." },
    shutterSpeed: { type: Type.STRING, description: "Shutter speed (e.g., 1/200s). Estimate based on motion blur or lack thereof." },
    iso: { type: Type.STRING, description: "ISO value (e.g., ISO 100). Estimate based on noise levels." },
    focalLength: { type: Type.STRING, description: "Focal length (e.g., 50mm). Estimate based on field of view and compression." },
    description: { type: Type.STRING, description: "A brief, 1-sentence analysis of the photography technique used." },
  },
  required: ["camera", "lens", "aperture", "shutterSpeed", "iso", "focalLength", "description"],
};

export const analyzeImageWithGemini = async (base64Image: string, mimeType: string): Promise<ExifData> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Analyze this image. Extract any readable EXIF metadata. If EXIF is stripped or unavailable, use your vision capabilities to infer the likely camera settings, gear, and techniques used to achieve this shot. Be precise and professional.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: exifSchema,
        temperature: 0.4, // Lower temperature for more deterministic/analytical results
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("Empty response from Gemini");
    }

    return JSON.parse(jsonText) as ExifData;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

// Helper to convert File or Blob to Base64
export const fileToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
        // Remove the Data-URL prefix (e.g., "data:image/jpeg;base64,")
        const result = reader.result as string;
        const base64 = result.split(',')[1]; 
        resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};