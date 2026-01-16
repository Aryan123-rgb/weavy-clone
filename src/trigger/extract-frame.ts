import { task } from "@trigger.dev/sdk/v3";
import { v2 as cloudinary } from "cloudinary";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";
import os from "os";
import { env } from "~/env";

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});
export const extractFrameTask = task({
    id: "extract-video-frame",
    retry: {
        maxAttempts: 1,
    },
    run: async (payload: { videoUrl: string; timestamp: number }) => {
        const { videoUrl, timestamp } = payload;

        if (!ffmpegPath) {
            throw new Error("FFmpeg path not found");
        }

        ffmpeg.setFfmpegPath(ffmpegPath);

        const tempDir = os.tmpdir();
        const fileName = `frame-${Date.now()}.png`;
        const outputPath = path.join(tempDir, fileName);

        console.log(`Extracting frame from ${videoUrl} at ${timestamp}s to ${outputPath}`);

        try {
            await new Promise<void>((resolve, reject) => {
                ffmpeg(videoUrl)
                    .seekInput(timestamp)
                    .outputOptions([
                        '-frames:v 1',
                        '-q:v 2',
                    ])
                    .output(outputPath)
                    .on("end", () => {
                        console.log("Frame extraction completed");
                        resolve()
                    })
                    .on("error", (err) => {
                        console.error("Frame extraction failed", err);
                        reject(new Error("Failed to extract frame"))
                    })
                    .run();
            });

            // Verify the file was created
            if (!fs.existsSync(outputPath)) {
                throw new Error("Frame file was not created");
            }

            console.log("Frame extracted, uploading to Cloudinary...");
            const response = await cloudinary.uploader.upload(outputPath, {
                upload_preset: env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
                folder: "weavy-clone/frames",
                resource_type: "image"
            });

            fs.unlinkSync(outputPath);

            return {
                imageUrl: response.secure_url
            };
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
            throw error;
        }
    },
});
