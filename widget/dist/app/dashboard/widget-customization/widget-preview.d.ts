interface Customization {
    logoUrl: string;
    companyName: string;
    widgetTitle: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    cardBackgroundColor: string;
    textColor: string;
    borderColor: string;
    darkPrimaryColor: string;
    darkSecondaryColor: string;
    darkBackgroundColor: string;
    darkCardBackgroundColor: string;
    darkTextColor: string;
    darkBorderColor: string;
    fontFamily: string;
    fontSize: string;
    headingFontFamily: string;
    borderRadius: string;
    spacing: string;
    customCss: string;
}
interface WidgetPreviewProps {
    customization: Customization;
}
export declare function WidgetPreview({ customization }: WidgetPreviewProps): import("react").JSX.Element;
export {};
