import { HTMLMotionProps } from 'motion/react';
export declare const GRADIENT_ANGLES: {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export type ProgressiveBlurProps = {
    direction?: keyof typeof GRADIENT_ANGLES;
    blurLayers?: number;
    className?: string;
    blurIntensity?: number;
} & HTMLMotionProps<'div'>;
export declare function ProgressiveBlur({ direction, blurLayers, className, blurIntensity, ...props }: ProgressiveBlurProps): import("react").JSX.Element;
