import { default as React } from 'react';
interface PulsatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pulseColor?: string;
    duration?: string;
}
export declare const PulsatingButton: React.ForwardRefExoticComponent<PulsatingButtonProps & React.RefAttributes<HTMLButtonElement>>;
export {};
