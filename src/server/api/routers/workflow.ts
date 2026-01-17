import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { tasks, runs } from "@trigger.dev/sdk/v3";
import type { runLLMTask } from "~/trigger/task";

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
  runLLM: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        system: z.string().optional(),
        imageURL: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { userId } = await auth();
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        // 1. Trigger the task
        const handle = await tasks.trigger<typeof runLLMTask>(
          "run-llm-task",
          input,
        );

        // 2. Poll for completion
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

          if (
            task.status === "FAILED" ||
            task.status === "CANCELED" ||
            task.status === "CRASHED"
          ) {
            return {
              error: { message: "AI Task failed or was canceled." },
              status: task.status,
              id: task.id,
            };
          }

          // Wait 1s before checking again
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }

        throw new TRPCError({
          code: "TIMEOUT",
          message: "Task timed out polling for result",
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("RunLLM Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown Error",
        });
      }
    }),
    save: publicProcedure
    .input(
      z.object({
        id: z.string(),
        definition: z.custom<any>((val) => {
          // Rudimentary validation: check if it's an object (JSON)
          return typeof val === "object" && val !== null;
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = await auth();
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return ctx.db.workflow.update({
        where: {
          id: input.id,
          // Ensure user owns the workflow if necessary, though typical for MVP valid check is fine
        },
        data: {
          definition: input.definition,
        },
      });
    }),
});
