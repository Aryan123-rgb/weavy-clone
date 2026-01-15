import { task, wait } from "@trigger.dev/sdk/v3";

export const runLLMTask = task({
  id: "run-llm-task",
  // Set an optional maxDuration to prevent it from running indefinitely
  run: async (payload: { prompt: string; system?: string; image?: any }) => {
    console.log("Running LLM Task with payload:", payload);

    // Simulate 10 second timeout
    await wait.for({ seconds: 10 });

    return {
      result: "Hello, this is the response form AI",
    };
  },
});
