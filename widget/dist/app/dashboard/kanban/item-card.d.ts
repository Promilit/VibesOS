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
interface ItemCardProps {
    item: Item;
    isDragging?: boolean;
    boardId?: Id<"kanbanBoards">;
}
export declare function ItemCard({ item, isDragging, boardId }: ItemCardProps): import("react").JSX.Element;
export {};
