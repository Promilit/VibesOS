import { Id } from '../../../../../widget/convex/_generated/dataModel';
interface Column {
    _id: Id<"projectColumns">;
    name: string;
    slug: string;
    order: number;
    canAddItems: boolean;
}
interface CreateItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: Id<"projects">;
    boardId: Id<"projectBoards">;
    columns: Column[];
}
export declare function CreateItemDialog({ open, onOpenChange, projectId, boardId, columns, }: CreateItemDialogProps): import("react").JSX.Element;
export {};
