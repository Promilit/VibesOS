import { Icon } from '@tabler/icons-react';
import { SidebarGroup } from '../../widget/components/ui/sidebar';
import * as React from "react";
export declare function NavSecondary({ items, ...props }: {
    items: {
        title: string;
        url: string;
        icon: Icon;
    }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>): React.JSX.Element;
