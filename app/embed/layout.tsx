/**
 * Embed Layout
 * Minimal layout for the iframe embed - no auth wrappers or navigation
 */

import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import "./globals.css";

export const metadata = {
  title: "UserVibes Widget",
  description: "Embeddable Kanban widget for feedback collection",
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
  );
}
