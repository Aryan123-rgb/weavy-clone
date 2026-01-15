"use server";

import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { runLLMTask } from "~/trigger/task";

export async function triggerLLMRun(payload: { prompt: string; system?: string; image?: any }) {
    // 1. Trigger the task
    const handle = await tasks.trigger<typeof runLLMTask>("run-llm-task", payload);

    // 2. Poll for completion
    // We poll because the UI needs the result, and we want to bridge the async task to the sync UI request
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max wait

    while (attempts < maxAttempts) {
        const task = await runs.retrieve(handle.id);

        if (task.status === "COMPLETED") {
            return {
                output: task.output,
                status: task.status,
                id: task.id,
            };
        }

        if (task.status === "FAILED" || task.status === "CANCELED" || task.status === "CRASHED") {
            // Return error object so UI can handle it gracefully (toast)
            return {
                error: { message: "AI Task failed or was canceled." },
                status: task.status,
                id: task.id
            };
        }

        // Wait 1s before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
    }

    throw new Error("Task timed out polling for result");
}
