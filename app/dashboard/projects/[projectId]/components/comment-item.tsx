"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Trash2, Edit2, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Comment {
  _id: Id<"projectComments">;
  authorId: string;
  authorType: "admin" | "user";
  content: string;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
  replies: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onReply: (parentCommentId: Id<"projectComments">) => void;
  depth?: number;
}

export function CommentItem({ comment, currentUserId, onReply, depth = 0 }: CommentItemProps) {
  const deleteComment = useMutation(api.projects.comments.mutations.deleteComment);
  const updateComment = useMutation(api.projects.comments.mutations.updateComment);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAuthor = comment.authorId === currentUserId;
  const canDelete = isAuthor; // Admin check is handled in backend

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteComment({ commentId: comment._id });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Failed to delete comment. You may not have permission.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateComment({
        commentId: comment._id,
        content: editContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update comment:", error);
      alert("Failed to update comment. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  // Don't render if deleted and no replies
  if (comment.isDeleted && comment.replies.length === 0) {
    return null;
  }

  return (
    <div className={`${depth > 0 ? "ml-8 mt-3" : "mt-4"}`}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {comment.authorType === "admin" ? "Admin" : "User"} {comment.authorId.slice(0, 8)}
              </span>
              <span className="text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
              {comment.updatedAt > comment.createdAt && (
                <span className="text-xs text-muted-foreground italic">(edited)</span>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  disabled={isUpdating}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isUpdating || !editContent.trim()}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-foreground">
                {comment.isDeleted ? (
                  <span className="italic text-muted-foreground">[deleted]</span>
                ) : (
                  comment.content
                )}
              </p>
            )}
          </div>

          {!comment.isDeleted && !isEditing && (
            <div className="flex gap-1">
              {isAuthor && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-7 px-2"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
              {canDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-7 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {!comment.isDeleted && !isEditing && depth < 3 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReply(comment._id)}
            className="h-7 px-2 text-xs"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
              The comment will be marked as [deleted] but replies will remain visible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
