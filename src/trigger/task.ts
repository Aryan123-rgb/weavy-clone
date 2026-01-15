import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runLLMTask = task({
  id: "run-llm-task",
  retry: {
    maxAttempts: 1, // Disable retries as requested
  },
  run: async (payload: { prompt: string; system?: string; image?: any }) => {

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY Not set");
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);

      // Use system instruction if available in SDK, or fallback to prepending
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: payload.system ? {
          role: "system",
          parts: [{ text: payload.system }]
        } : undefined
      });

      const parts: any[] = [];

      // Add text prompt
      parts.push({ text: payload.prompt });

      // TODO: Handle image if payload.image is provided structure suitable for Gemini
      // if (payload.image) ...

      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      return {
        result: text,
      };
    } catch (error) {
      console.error("Gemini AI generation failed:", error);
      throw error; // Throwing ensures task fails and we catch it in polling
    }
  },
});
