import { Id } from '../../../widget/convex/_generated/dataModel';
interface CreateItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    boardId: Id<"kanbanBoards">;
}
export declare function CreateItemDialog({ open, onOpenChange, boardId }: CreateItemDialogProps): import("react").JSX.Element;
export {};
