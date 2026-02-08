
import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation } from "../types";

// Lazy initialization to handle environment and key issues gracefully
let genAI: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!genAI) {
    if (!process.env.API_KEY) {
      console.error("Gemini API key is missing. AI features will not work.");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const getCreativeRecommendation = async (userPreference: string): Promise<Recommendation> => {
  const ai = getAIClient();
  if (!ai) {
    throw new Error("AI service is currently unavailable. Please check the API key.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the preference "${userPreference}", suggest a unique 3D cartoon room or level theme for Mnostva Art. Mnostva Art specializes in kidcore, stylized, purple/pink shades, and cozy vibes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedColors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            theme: { type: Type.STRING }
          },
          required: ["title", "description", "suggestedColors", "theme"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from AI");
    }
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    if (error?.status === 403) {
      throw new Error("Access Forbidden (403): Please verify your API key permissions.");
    }
    throw error;
  }
};
