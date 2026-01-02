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
interface SortableItemCardProps {
    item: Item;
    boardId: Id<"kanbanBoards">;
}
export declare function SortableItemCard({ item, boardId }: SortableItemCardProps): import("react").JSX.Element;
export {};
