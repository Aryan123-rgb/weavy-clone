"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(30, "Name must be at most 30 characters long"),
});

export function CreateWorkflowDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const createMutation = api.workflow.create.useMutation({
    onSuccess: (data) => {
      toast.success("Workflow created!");
      setOpen(false);
      router.push(`/flow/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button 
            className="gap-2 rounded-lg bg-[#E0FC00] px-4 py-2 text-sm font-semibold text-black hover:bg-[#c9e200] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create New File
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription className="text-gray-400">
            Give your new workflow a name to get started.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My Awesome Workflow" 
                      {...field} 
                      className="bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="justify-end sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-white/10 text-white">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="bg-[#E0FC00] text-black hover:bg-[#c9e200]"
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
