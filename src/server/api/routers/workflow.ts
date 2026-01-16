import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import { extractFrameTask } from "~/trigger/extract-frame";

export const workflowRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ name: z.string().min(1, "Name is required") }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();

      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.workflow.create({
        data: {
          name: input.name,
          userId: userId,
        },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = await auth();

      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return ctx.db.workflow.findFirst({
        where: {
          id: input.id,
        },
      });
    }),

  extractFrame: publicProcedure
    .input(
      z.object({
        liveVideoUrl: z.string().url(),
        timestamp: z.number().min(0),
      }),
    )
    .mutation(async ({ input }) => {
      const { userId } = await auth();
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const handle = await tasks.trigger<typeof extractFrameTask>(
          "extract-video-frame",
          {
            videoUrl: input.liveVideoUrl,
            timestamp: input.timestamp,
          },
        );
        return { triggerId: handle.id };
      } catch (error) {
        console.error("Failed to trigger task", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to start extraction task",
        });
      }
    }),

  getExtractionStatus: publicProcedure
    .input(z.object({ triggerId: z.string() }))
    .query(async ({ input }) => {
      const { userId } = await auth();
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        const run = await runs.retrieve(input.triggerId);
        return {
          status: run.status,
          output: run.output,
          error: run.error,
        };
      } catch (error) {
        console.error("Failed to retrieve task", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get task status",
        });
      }
    }),
});
