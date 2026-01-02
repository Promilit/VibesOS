import { Id } from '../../../widget/convex/_generated/dataModel';
interface Item {
    _id: Id<"kanbanItems">;
    title: string;
    description?: string;
    voteCount: number;
    position: number;
    status: "backlog" | "in-progress" | "review" | "done";
    createdAt: number;
    createdByUserId?: string;
    createdByAdminId?: string;
}
interface EditItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: Item;
    boardId: Id<"kanbanBoards">;
}
export declare function EditItemDialog({ open, onOpenChange, item, boardId }: EditItemDialogProps): import("react").JSX.Element;
export {};
