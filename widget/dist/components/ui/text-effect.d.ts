import { Transition, Variants } from 'motion/react';
import { default as React } from 'react';
export type PresetType = 'blur' | 'fade-in-blur' | 'scale' | 'fade' | 'slide';
export type PerType = 'word' | 'char' | 'line';
export type TextEffectProps = {
    children: string;
    per?: PerType;
    as?: keyof React.JSX.IntrinsicElements;
    variants?: {
        container?: Variants;
        item?: Variants;
    };
    className?: string;
    preset?: PresetType;
    delay?: number;
    speedReveal?: number;
    speedSegment?: number;
    trigger?: boolean;
    onAnimationComplete?: () => void;
    onAnimationStart?: () => void;
    segmentWrapperClassName?: string;
    containerTransition?: Transition;
    segmentTransition?: Transition;
    style?: React.CSSProperties;
};
export declare function TextEffect({ children, per, as, variants, className, preset, delay, speedReveal, speedSegment, trigger, onAnimationComplete, onAnimationStart, segmentWrapperClassName, containerTransition, segmentTransition, style, }: TextEffectProps): React.JSX.Element;
