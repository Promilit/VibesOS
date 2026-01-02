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
interface ProjectItemCardProps {
    item: Item;
    isDragging?: boolean;
    onClick?: () => void;
}
export declare function ProjectItemCard({ item, isDragging, onClick }: ProjectItemCardProps): import("react").JSX.Element;
export {};
