import { Id } from '../../../../../widget/convex/_generated/dataModel';
interface Column {
    _id: Id<"projectColumns">;
    name: string;
    slug: string;
    order: number;
    canAddItems: boolean;
}
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
interface ProjectColumnProps {
    column: Column;
    items: Item[];
    projectId: Id<"projects">;
    onItemClick?: (item: Item) => void;
}
export declare function ProjectColumn({ column, items, projectId, onItemClick }: ProjectColumnProps): import("react").JSX.Element;
export {};
