import { ReactNode, default as React } from 'react';
import { Variants } from 'motion/react';
export type PresetType = 'fade' | 'slide' | 'scale' | 'blur' | 'blur-slide' | 'zoom' | 'flip' | 'bounce' | 'rotate' | 'swing';
export type AnimatedGroupProps = {
    children: ReactNode;
    className?: string;
    variants?: {
        container?: Variants;
        item?: Variants;
    };
    preset?: PresetType;
    as?: string;
    asChild?: string;
};
declare function AnimatedGroup({ children, className, variants, preset, as, asChild, }: AnimatedGroupProps): React.JSX.Element;
export { AnimatedGroup };
