"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import { CommentItem } from "./comment-item";
import { useUser } from "@clerk/clerk-react";

interface CommentsSectionProps {
  itemId: Id<"projectItems">;
  projectId: Id<"projects">;
}

export function CommentsSection({ itemId, projectId }: CommentsSectionProps) {
  const { user } = useUser();
  const comments = useQuery(api.projects.comments.queries.getItemComments, { itemId });
  const createComment = useMutation(api.projects.comments.mutations.createComment);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<Id<"projectComments"> | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment({
        itemId,
        content: newComment.trim(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("Failed to create comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId: Id<"projectComments">) => {
    if (replyingTo === parentCommentId) {
      // Submit reply
      if (!replyContent.trim()) return;

      setIsSubmitting(true);
      try {
        await createComment({
          itemId,
          content: replyContent.trim(),
          parentCommentId,
        });
        setReplyContent("");
        setReplyingTo(null);
      } catch (error) {
        console.error("Failed to create reply:", error);
        alert("Failed to create reply. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Start replying
      setReplyingTo(parentCommentId);
      setReplyContent("");
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  if (comments === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentUserId = user?.id || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-2">
              {comments.map((comment: any) => (
                <div key={comment._id}>
                  <CommentItem
                    comment={comment}
                    currentUserId={currentUserId}
                    onReply={handleReply}
                  />
                  {replyingTo === comment._id && (
                    <div className="ml-8 mt-3 space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={3}
                        disabled={isSubmitting}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReply(comment._id)}
                          disabled={isSubmitting || !replyContent.trim()}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Replying...
                            </>
                          ) : (
                            "Reply"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelReply}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleCreateComment} className="space-y-2 pt-4 border-t">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
