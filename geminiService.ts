import { GoogleGenAI, Type } from "@google/genai";

export const generateRomanticMessage = async (): Promise<{ reason: string; poem: string }> => {
  // Always initialize GoogleGenAI with the API key from process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

    // Directly access the .text property of the response object
    const resultText = response.text || '';
    return JSON.parse(resultText.trim());
  } catch (e) {
    console.error("Gemini error:", e);
    // Return backup content if API call fails
    return {
      reason: "You are the sweetest person in my universe.",
      poem: "The stars shine bright, the moon is clear,\nBut nothing compares to when you are near.\nBe my Valentine, now and forever,\nThere is no one else I'd rather be with, ever."
    };
  }
};