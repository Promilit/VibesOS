import { Id } from '../../../../../widget/convex/_generated/dataModel';
interface Item {
    _id: Id<"projectItems">;
    title: string;
    description?: string;
    voteCount: number;
    commentCount: number;
    position: number;
    status: "backlog" | "in-progress" | "review" | "done";
    createdAt: number;
}
interface ItemDetailDialogProps {
    item: Item | null;
    projectId: Id<"projects">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
export declare function ItemDetailDialog({ item, projectId, open, onOpenChange }: ItemDetailDialogProps): import("react").JSX.Element | null;
export {};
