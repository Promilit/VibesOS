export type InfiniteSliderProps = {
    children: React.ReactNode;
    gap?: number;
    speed?: number;
    speedOnHover?: number;
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    className?: string;
};
export declare function InfiniteSlider({ children, gap, speed, speedOnHover, direction, reverse, className, }: InfiniteSliderProps): import("react").JSX.Element;
