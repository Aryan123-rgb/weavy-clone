import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
});
