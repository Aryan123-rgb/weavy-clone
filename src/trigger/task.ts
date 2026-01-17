import { task } from "@trigger.dev/sdk/v3";
import { env } from "~/env"

export const runLLMTask = task({
  id: "run-llm-task",
  retry: {
    maxAttempts: 1, // Disable retries as requested
  },
  run: async (payload: { prompt: string; system?: string; imageURL?: string }) => {
    
    // Validation for image URL
    if (payload.imageURL) {
      const lowerUrl = payload.imageURL.toLowerCase();
      const isDataUrl = lowerUrl.startsWith("https://res.cloudinary.com/");

      if (!isDataUrl) {
         throw new Error("Invalid image URL: Must be a Base64 Data URL starting with 'https://res.cloudinary.com/'. HTTP URLs are not supported.");
      }
    }

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

      // User Input
      const userContent: any[] = [{ type: "text", text: payload.prompt }];

      // Image Input
      // User requirement: "provide an empty image url if none specified"
      // using meta-llama/llama-4-scout-17b-16e-instruct
      userContent.push({
        type: "image_url",
        image_url: {
          url: payload.imageURL || "",
        }
      });

      messages.push({
        role: "user",
        content: userContent
      });

      const completion = await groq.chat.completions.create({
        messages: messages,
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
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
