"use server";

import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { runLLMTask } from "~/trigger/task";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import os from "os";
import path from "path";
// Ensure FFmpeg uses the static binary
if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
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

export async function extractVideoFrame(base64Video: string, timestamp: number) {
    // 1. Process with FFmpeg to extract frame at timestamp

    // Strip prefix if present (handle different video types)
    const base64Data = base64Video.replace(/^data:video\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const tempInput = path.join(os.tmpdir(), `video_input_${Date.now()}.mp4`);
    const tempOutput = path.join(os.tmpdir(), `frame_${Date.now()}.jpg`);

    fs.writeFileSync(tempInput, buffer);

    try {
        await new Promise((resolve, reject) => {
            ffmpeg(tempInput)
                .screenshots({
                    timestamps: [timestamp],
                    filename: path.basename(tempOutput),
                    folder: path.dirname(tempOutput),
                    size: '100%',
                })
                .on("end", resolve)
                .on("error", reject);
        });

        // 2. Read processed file and convert to Base64
        const outputBuffer = fs.readFileSync(tempOutput);
        const outputBase64 = `data:image/jpeg;base64,${outputBuffer.toString("base64")}`;

        return { url: outputBase64 };
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
