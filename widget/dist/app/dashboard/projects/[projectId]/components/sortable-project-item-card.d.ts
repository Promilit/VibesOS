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
interface SortableProjectItemCardProps {
    item: Item;
    projectId: Id<"projects">;
    onClick?: () => void;
}
export declare function SortableProjectItemCard({ item, projectId, onClick }: SortableProjectItemCardProps): import("react").JSX.Element;
export {};
