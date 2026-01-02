import { Id } from '../../../widget/convex/_generated/dataModel';
interface Column {
    _id: Id<"kanbanColumns">;
    name: string;
    slug: string;
    order: number;
    canAddItems: boolean;
}
interface Item {
    _id: Id<"kanbanItems">;
    title: string;
    description?: string;
    voteCount: number;
    position: number;
    status: "backlog" | "in-progress" | "review" | "done";
    createdAt: number;
}
interface KanbanColumnProps {
    column: Column;
    items: Item[];
    boardId: Id<"kanbanBoards">;
}
export declare function KanbanColumn({ column, items, boardId }: KanbanColumnProps): import("react").JSX.Element;
export {};
