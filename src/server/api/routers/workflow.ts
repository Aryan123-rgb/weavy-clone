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

      // Logic for Cloudinary URL transformation
      // We assume input.liveVideoUrl is a Cloudinary video URL.
      // E.g., https://res.cloudinary.com/<cloud_name>/video/upload/v<version>/<public_id>.<ext>
      
      const url = input.liveVideoUrl;
      
      if (!url.includes("/upload/")) {
         throw new TRPCError({
             code: "BAD_REQUEST",
             message: "Invalid Cloudinary Video URL",
         });
      }

      const timestamp = input.timestamp;
      
      // Inject `so_<timestamp>` (start offset) after `/upload/`
      // Change extension to .jpg (forcing image format)
      
      const parts = url.split("/upload/");
      const baseUrl = parts[0] + "/upload/";
      // rest contains potential version, path, and extension
      const rest = parts[1];
      
      if (!rest) {
        throw new TRPCError({
             code: "BAD_REQUEST",
             message: "Invalid Cloudinary Video URL Format",
         });
      }

      const transformation = `so_${timestamp},f_jpg,fl_attachment:false`; 
      
      // Remove extension from valid URL:
      const lastDotIndex = rest.lastIndexOf(".");
      const restNoExt = lastDotIndex !== -1 ? rest.substring(0, lastDotIndex) : rest;
      
      const finalUrl = `${baseUrl}${transformation}/${restNoExt}.jpg`;

      return { imageUrl: finalUrl };
    }),
});
