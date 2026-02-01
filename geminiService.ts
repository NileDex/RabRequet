
import { GoogleGenAI, Type } from "@google/genai";

export const generateRomanticMessage = async (): Promise<{ reason: string; poem: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Generate a very short, cute, and sweet "Reason why I love you" and a 4-line cute Valentine poem. Keep it generic enough for a romantic partner.',
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reason: { type: Type.STRING, description: 'A cute one-sentence reason' },
          poem: { type: Type.STRING, description: 'A 4-line rhyming poem' }
        },
        required: ['reason', 'poem']
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"reason": "You are the sweetest person ever.", "poem": "Roses are red, violets are blue, the world is brighter, because of you."}');
  } catch (e) {
    return {
      reason: "You make every day feel like a dream come true.",
      poem: "Hearts beat fast, love grows deep,\nPromises of forever, are ours to keep.\nHand in hand, we'll walk the way,\nHappy Valentine's, my love, today!"
    };
  }
};
