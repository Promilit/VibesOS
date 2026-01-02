interface AttractButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    particleCount?: number;
    attractRadius?: number;
}
export default function AttractButton({ className, particleCount, attractRadius, ...props }: AttractButtonProps): import("react").JSX.Element;
export {};
