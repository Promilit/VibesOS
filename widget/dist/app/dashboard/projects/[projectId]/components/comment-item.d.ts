import { Id } from '../../../../../widget/convex/_generated/dataModel';
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
export declare function CommentItem({ comment, currentUserId, onReply, depth }: CommentItemProps): import("react").JSX.Element | null;
export {};
