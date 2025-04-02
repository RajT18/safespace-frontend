import * as z from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { FileUploader, Loader } from "@/components/shared";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";
import { useState } from "react";

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [moderationErrors, setModerationErrors] = useState<
    Array<{ type: string; message: string }>
  >([]);

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

  // Query
  const { mutateAsync: createPost } = useCreatePost();
  const { mutateAsync: updatePost } = useUpdatePost();

  // Handler
  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    try {
      // First check image moderation
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", value.file[0]); // Ensure 'file' matches API docs

      const apiResponse = await fetch(
        "https://safespacebackend-hjlj.onrender.com/classify",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!apiResponse.ok) {
        throw new Error(
          `Error: ${apiResponse.status} ${apiResponse.statusText}`
        );
      }

      const data = await apiResponse.json();
      console.log("Moderation Response:", data);
      if (data.error) {
        throw new Error(data.error);
      }

      let moderationArray = [];
      const { porn_moderation, drug_moderation, gore_moderation } = data;

      if (porn_moderation && drug_moderation && gore_moderation) {
        if (porn_moderation.porn_content) {
          moderationArray.push({
            type: "porn",
            message: "Porn Content Detected in your Media",
          });
        }
        if (drug_moderation.drug_content) {
          moderationArray.push({
            type: "drug",
            message: "Drug Content Detected in your Media",
          });
        }
        if (gore_moderation.gore_content) {
          moderationArray.push({
            type: "gore",
            message: "Gore Content Detected in your Media",
          });
        }
      }

      // If moderation errors exist, show dialog and return
      if (moderationArray.length > 0) {
        setModerationErrors(moderationArray);
        setShowModerationDialog(true);
        return;
      }

      // If no moderation errors, proceed with post creation/update
      if (post && action === "Update") {
        const updatedPost = await updatePost({
          ...value,
          postId: post.$id,
          imageId: post.imageId,
          imageUrl: post.imageUrl,
        });

        if (!updatedPost) {
          toast({
            title: `${action} post failed. Please try again.`,
          });
          return;
        }
        return navigate(`/posts/${post.$id}`);
      }

      // ACTION = CREATE
      const newPost = await createPost({
        ...value,
        userId: user.id,
      });

      if (!newPost) {
        toast({
          title: `${action} post failed. Please try again.`,
        });
        return;
      }

      navigate("/");
    } catch (error: any) {
      toast({
        title: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={showModerationDialog}
        onOpenChange={setShowModerationDialog}>
        <DialogContent
          className="sm:max-w-[425px] bg-dark-1"
          style={{ border: "3px solid #e90505", borderRadius: "12px" }}>
          <DialogHeader>
            <DialogTitle>⚠️ Sensitive Content Detected</DialogTitle>
            <DialogDescription className="space-y-2">
              {moderationErrors.map((error, index) => (
                <p
                  key={index}
                  className="bg-[#e90505] text-white px-2 py-1 mt-2"
                  style={{ borderRadius: "6px" }}>
                  {error.message}
                </p>
              ))}
              <p className="pt-2">
                Please upload appropriate content that follows our community
                guidelines.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              className="border border-[#e90505] hover:bg-[#e90505] hover:text-white"
              style={{ borderRadius: "8px" }}
              onClick={() => setShowModerationDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-9 w-full max-w-5xl">
          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Caption</FormLabel>
                <FormControl>
                  <Textarea
                    className="shad-textarea custom-scrollbar"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Add Photos</FormLabel>
                <FormControl>
                  <FileUploader
                    fieldChange={field.onChange}
                    mediaUrl={post?.imageUrl}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Add Location</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">
                  Add Tags (separated by comma " , ")
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Art, Expression, Learn"
                    type="text"
                    className="shad-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />

          <div className="flex gap-4 items-center justify-end">
            <Button
              type="button"
              className="shad-button_dark_4"
              onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className={`shad-button_primary whitespace-nowrap ${
                isLoading ? "opacity-50" : ""
              }`}
              disabled={isLoading}>
              {isLoading && <Loader />}
              {action} Post
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default PostForm;
