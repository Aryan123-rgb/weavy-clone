import { task } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/env"

export const runLLMTask = task({
  id: "run-llm-task",
  retry: {
    maxAttempts: 1, // Disable retries as requested
  },
  run: async (payload: { prompt: string; system?: string; image?: string }) => {

    const apiKey = env.GROQ_API_KEY;

    try {
      const { Groq } = await import("groq-sdk");
      const groq = new Groq({ apiKey });

      const messages: any[] = [];

      // System Input
      if (payload.system) {
        messages.push({
          role: "system",
          content: payload.system
        });
      }

      // User Input (Content can be string or array for vision)
      const userContent: any[] = [{ type: "text", text: payload.prompt }];

      // Image Input
      if (payload.image) {
        // payload.image is expected to be a data URL or base64 string
        // Groq/OpenAI format expects data URL
        userContent.push({
          type: "image_url",
          image_url: {
            url: payload.image,
          }
        });
      }

      messages.push({
        role: "user",
        content: userContent
      });

      const completion = await groq.chat.completions.create({
        messages: messages,
        model: payload.image ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile",
      });

      const text = completion.choices[0]?.message?.content || "";

      return {
        result: text,
      };
    } catch (error) {
      console.error("Groq AI generation failed:", error);
      throw error;
    }
  },
});
