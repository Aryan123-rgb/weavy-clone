"use server";

import { tasks } from "@trigger.dev/sdk/v3";
import type { runLLMTask } from "~/trigger/task";

export async function triggerLLMRun(payload: { prompt: string; system?: string; image?: any }) {
    const handle = await tasks.trigger<typeof runLLMTask>("run-llm-task", payload);
    return handle;
}
