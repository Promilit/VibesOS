import { z } from 'zod';
import * as React from "react";
export declare const schema: z.ZodObject<{
    id: z.ZodNumber;
    header: z.ZodString;
    type: z.ZodString;
    status: z.ZodString;
    target: z.ZodString;
    limit: z.ZodString;
    reviewer: z.ZodString;
}, "strip", z.ZodTypeAny, {
    header: string;
    id: number;
    type: string;
    target: string;
    status: string;
    limit: string;
    reviewer: string;
}, {
    header: string;
    id: number;
    type: string;
    target: string;
    status: string;
    limit: string;
    reviewer: string;
}>;
export declare function DataTable({ data: initialData, }: {
    data: z.infer<typeof schema>[];
}): React.JSX.Element;
