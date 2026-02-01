import { GoogleGenAI, Type } from "@google/genai";

export const generateRomanticMessage = async (): Promise<{ reason: string; poem: string }> => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    return {
      reason: "You make every day feel like a dream come true.",
      poem: "Roses are red, violets are blue,\nLife is a gift when I am with you.\nNo matter where our journey may go,\nMy love for you will always grow."
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
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

    const resultText = response.text || '';
    return JSON.parse(resultText.trim());
  } catch (e) {
    console.error("Gemini error:", e);
    return {
      reason: "You are the sweetest person in my universe.",
      poem: "The stars shine bright, the moon is clear,\nBut nothing compares to when you are near.\nBe my Valentine, now and forever,\nThere is no one else I'd rather be with, ever."
    };
  }
};