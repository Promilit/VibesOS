import { default as React, ComponentPropsWithoutRef } from 'react';
export declare function AnimatedListItem({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
    children: React.ReactNode;
    delay?: number;
}
export declare const AnimatedList: React.MemoExoticComponent<({ children, className, delay, ...props }: AnimatedListProps) => React.JSX.Element>;
