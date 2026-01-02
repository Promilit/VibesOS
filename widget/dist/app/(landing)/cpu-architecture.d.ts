import { default as React } from 'react';
export interface CpuArchitectureSvgProps {
    className?: string;
    width?: string;
    height?: string;
    text?: string;
    showCpuConnections?: boolean;
    lineMarkerSize?: number;
    animateText?: boolean;
    animateLines?: boolean;
    animateMarkers?: boolean;
}
declare const CpuArchitecture: ({ className, width, height, text, showCpuConnections, animateText, lineMarkerSize, animateLines, animateMarkers, }: CpuArchitectureSvgProps) => React.JSX.Element;
export { CpuArchitecture };
