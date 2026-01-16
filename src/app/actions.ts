"use server";

import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { runLLMTask } from "~/trigger/task";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { env } from "~/env";
import fs from "fs";
import os from "os";
import path from "path";

// Ensure FFmpeg uses the static binary
if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

export async function uploadImageToTransloadit(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    const templateId = env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID;
    const authKey = env.NEXT_PUBLIC_TRANSLOADIT_KEY;

    // Direct upload to Transloadit API
    const assemblyUrl = "https://api2.transloadit.com/assemblies";

    const uploadData = new FormData();
    uploadData.append("params", JSON.stringify({
        auth: { key: authKey },
        template_id: templateId,
    }));
    uploadData.append("file", file);

    const response = await fetch(assemblyUrl, {
        method: "POST",
        body: uploadData,
    });

    if (!response.ok) {
        throw new Error(`Transloadit Upload Failed: ${response.statusText}`);
    }

    const json = await response.json();
    // Assuming the template produces a result named 'derived' or similar, or just returns the original 'uploads'
    // We'll take the first uploaded/result file URL.
    // Transloadit JSON structure: { results: { [stepName]: [ { ssl_url: ... } ] }, uploads: [ ... ] }

    // If template has steps, look in results. If not, look in uploads.
    let sslUrl = "";
    if (json.results && Object.keys(json.results).length > 0) {
        const keys = Object.keys(json.results);
        if (keys.length > 0 && keys[0]) {
            const firstStep = keys[0];
            const stepResults = json.results[firstStep];
            if (Array.isArray(stepResults) && stepResults.length > 0) {
                sslUrl = stepResults[0]?.ssl_url || "";
            }
        }
    } else if (json.uploads && json.uploads.length > 0) {
        sslUrl = json.uploads[0]?.ssl_url || "";
    }

    if (!sslUrl) throw new Error("No URL returned from Transloadit");

    return { url: sslUrl };
}

export async function cropImage(base64Image: string, crop: { x: number; y: number; width: number; height: number }) {
    // 1. Process with FFmpeg
    // We expect x, y, width, height to be percentages (0-100)
    
    // Strip prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.jpg`);
    const tempOutput = path.join(os.tmpdir(), `crop_${Date.now()}.jpg`);

    fs.writeFileSync(tempInput, buffer);

    // width_pct = crop.width / 100
    // height_pct = crop.height / 100
    // x_pct = crop.x / 100
    // y_pct = crop.y / 100
    
    const cropFilter = `crop=iw*(${crop.width}/100):ih*(${crop.height}/100):iw*(${crop.x}/100):ih*(${crop.y}/100)`;

    try {
        await new Promise((resolve, reject) => {
            ffmpeg(tempInput)
                .videoFilters(cropFilter)
                .output(tempOutput)
                .on("end", resolve)
                .on("error", reject)
                .run();
        });

        // 2. Read processed file and convert to Base64
        const outputBuffer = fs.readFileSync(tempOutput);
        const outputBase64 = `data:image/jpeg;base64,${outputBuffer.toString("base64")}`;
        
        return { url: outputBase64 }; // Returning as 'url' to match expected interface, but it's a data ID
    } finally {
        // Clean up
        if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
        if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    }
}

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
