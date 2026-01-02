declare const _default: import('convex/server').SchemaDefinition<{
    users: import('convex/server').TableDefinition<import('convex/values').VObject<{
        name: string;
        externalId: string;
    }, {
        name: import('convex/values').VString<string, "required">;
        externalId: import('convex/values').VString<string, "required">;
    }, "required", "name" | "externalId">, {
        byExternalId: ["externalId", "_creationTime"];
    }, {}, {}>;
    paymentAttempts: import('convex/server').TableDefinition<import('convex/values').VObject<{
        failed_at?: number | undefined;
        failed_reason?: {
            decline_code?: string | undefined;
            code: string;
        } | undefined;
        paid_at?: number | undefined;
        userId?: import('convex/values').GenericId<"users"> | undefined;
        status: string;
        billing_date: number;
        charge_type: string;
        created_at: number;
        invoice_id: string;
        payment_id: string;
        statement_id: string;
        updated_at: number;
        payer: {
            email: string;
            first_name: string;
            last_name: string;
            user_id: string;
        };
        payment_source: {
            card_type: string;
            last4: string;
        };
        subscription_items: {
            status: string;
            amount: {
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            };
            plan: {
                id: string;
                name: string;
                amount: number;
                currency: string;
                slug: string;
                period: string;
                interval: number;
            };
            period_start: number;
            period_end: number;
        }[];
        totals: {
            grand_total: {
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            };
            subtotal: {
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            };
            tax_total: {
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            };
        };
    }, {
        userId: import('convex/values').VId<import('convex/values').GenericId<"users"> | undefined, "optional">;
        billing_date: import('convex/values').VFloat64<number, "required">;
        charge_type: import('convex/values').VString<string, "required">;
        created_at: import('convex/values').VFloat64<number, "required">;
        failed_at: import('convex/values').VFloat64<number | undefined, "optional">;
        failed_reason: import('convex/values').VObject<{
            decline_code?: string | undefined;
            code: string;
        } | undefined, {
            code: import('convex/values').VString<string, "required">;
            decline_code: import('convex/values').VString<string | undefined, "optional">;
        }, "optional", "code" | "decline_code">;
        invoice_id: import('convex/values').VString<string, "required">;
        paid_at: import('convex/values').VFloat64<number | undefined, "optional">;
        payment_id: import('convex/values').VString<string, "required">;
        statement_id: import('convex/values').VString<string, "required">;
        status: import('convex/values').VString<string, "required">;
        updated_at: import('convex/values').VFloat64<number, "required">;
        payer: import('convex/values').VObject<{
            email: string;
            first_name: string;
            last_name: string;
            user_id: string;
        }, {
            email: import('convex/values').VString<string, "required">;
            first_name: import('convex/values').VString<string, "required">;
            last_name: import('convex/values').VString<string, "required">;
            user_id: import('convex/values').VString<string, "required">;
        }, "required", "email" | "first_name" | "last_name" | "user_id">;
        payment_source: import('convex/values').VObject<{
            card_type: string;
            last4: string;
        }, {
            card_type: import('convex/values').VString<string, "required">;
            last4: import('convex/values').VString<string, "required">;
        }, "required", "card_type" | "last4">;
        subscription_items: import('convex/values').VArray<{
            status: string;
            amount: {
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            };
            plan: {
                id: string;
                name: string;
                amount: number;
                currency: string;
                slug: string;
                period: string;
                interval: number;
            };
            period_start: number;
            period_end: number;
        }[], import('convex/values').VObject<{
            status: string;
            amount: {
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            };
            plan: {
                id: string;
                name: string;
                amount: number;
                currency: string;
                slug: string;
                period: string;
                interval: number;
            };
            period_start: number;
            period_end: number;
        }, {
            amount: import('convex/values').VObject<{
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            }, {
                amount: import('convex/values').VFloat64<number, "required">;
                amount_formatted: import('convex/values').VString<string, "required">;
                currency: import('convex/values').VString<string, "required">;
                currency_symbol: import('convex/values').VString<string, "required">;
            }, "required", "amount" | "amount_formatted" | "currency" | "currency_symbol">;
            plan: import('convex/values').VObject<{
                id: string;
                name: string;
                amount: number;
                currency: string;
                slug: string;
                period: string;
                interval: number;
            }, {
                id: import('convex/values').VString<string, "required">;
                name: import('convex/values').VString<string, "required">;
                slug: import('convex/values').VString<string, "required">;
                amount: import('convex/values').VFloat64<number, "required">;
                currency: import('convex/values').VString<string, "required">;
                period: import('convex/values').VString<string, "required">;
                interval: import('convex/values').VFloat64<number, "required">;
            }, "required", "id" | "name" | "amount" | "currency" | "slug" | "period" | "interval">;
            status: import('convex/values').VString<string, "required">;
            period_start: import('convex/values').VFloat64<number, "required">;
            period_end: import('convex/values').VFloat64<number, "required">;
        }, "required", "status" | "amount" | "plan" | "period_start" | "period_end" | "amount.amount" | "amount.amount_formatted" | "amount.currency" | "amount.currency_symbol" | "plan.id" | "plan.name" | "plan.amount" | "plan.currency" | "plan.slug" | "plan.period" | "plan.interval">, "required">;
        totals: import('convex/values').VObject<{
            grand_total: {
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            };
            subtotal: {
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            };
            tax_total: {
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            };
        }, {
            grand_total: import('convex/values').VObject<{
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            }, {
                amount: import('convex/values').VFloat64<number, "required">;
                amount_formatted: import('convex/values').VString<string, "required">;
                currency: import('convex/values').VString<string, "required">;
                currency_symbol: import('convex/values').VString<string, "required">;
            }, "required", "amount" | "amount_formatted" | "currency" | "currency_symbol">;
            subtotal: import('convex/values').VObject<{
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            }, {
                amount: import('convex/values').VFloat64<number, "required">;
                amount_formatted: import('convex/values').VString<string, "required">;
                currency: import('convex/values').VString<string, "required">;
                currency_symbol: import('convex/values').VString<string, "required">;
            }, "required", "amount" | "amount_formatted" | "currency" | "currency_symbol">;
            tax_total: import('convex/values').VObject<{
                amount: number;
                amount_formatted: string;
                currency: string;
                currency_symbol: string;
            }, {
                amount: import('convex/values').VFloat64<number, "required">;
                amount_formatted: import('convex/values').VString<string, "required">;
                currency: import('convex/values').VString<string, "required">;
                currency_symbol: import('convex/values').VString<string, "required">;
            }, "required", "amount" | "amount_formatted" | "currency" | "currency_symbol">;
        }, "required", "grand_total" | "subtotal" | "tax_total" | "grand_total.amount" | "grand_total.amount_formatted" | "grand_total.currency" | "grand_total.currency_symbol" | "subtotal.amount" | "subtotal.amount_formatted" | "subtotal.currency" | "subtotal.currency_symbol" | "tax_total.amount" | "tax_total.amount_formatted" | "tax_total.currency" | "tax_total.currency_symbol">;
    }, "required", "status" | "billing_date" | "charge_type" | "created_at" | "failed_at" | "failed_reason" | "invoice_id" | "paid_at" | "payment_id" | "statement_id" | "updated_at" | "payer" | "payment_source" | "subscription_items" | "totals" | "failed_reason.code" | "failed_reason.decline_code" | "payer.email" | "payer.first_name" | "payer.last_name" | "payer.user_id" | "payment_source.card_type" | "payment_source.last4" | "totals.grand_total" | "totals.subtotal" | "totals.tax_total" | "totals.grand_total.amount" | "totals.grand_total.amount_formatted" | "totals.grand_total.currency" | "totals.grand_total.currency_symbol" | "totals.subtotal.amount" | "totals.subtotal.amount_formatted" | "totals.subtotal.currency" | "totals.subtotal.currency_symbol" | "totals.tax_total.amount" | "totals.tax_total.amount_formatted" | "totals.tax_total.currency" | "totals.tax_total.currency_symbol" | "userId">, {
        byPaymentId: ["payment_id", "_creationTime"];
        byUserId: ["userId", "_creationTime"];
        byPayerUserId: ["payer.user_id", "_creationTime"];
    }, {}, {}>;
    apiKeys: import('convex/server').TableDefinition<import('convex/values').VObject<{
        lastUsed?: number | undefined;
        expiresAt?: number | undefined;
        name: string;
        userId: string;
        keyHash: string;
        keyPrefix: string;
        createdAt: number;
        isActive: boolean;
    }, {
        userId: import('convex/values').VString<string, "required">;
        name: import('convex/values').VString<string, "required">;
        keyHash: import('convex/values').VString<string, "required">;
        keyPrefix: import('convex/values').VString<string, "required">;
        lastUsed: import('convex/values').VFloat64<number | undefined, "optional">;
        createdAt: import('convex/values').VFloat64<number, "required">;
        expiresAt: import('convex/values').VFloat64<number | undefined, "optional">;
        isActive: import('convex/values').VBoolean<boolean, "required">;
    }, "required", "name" | "userId" | "keyHash" | "keyPrefix" | "lastUsed" | "createdAt" | "expiresAt" | "isActive">, {
        byUserId: ["userId", "_creationTime"];
        byKeyHash: ["keyHash", "_creationTime"];
        byKeyPrefix: ["keyPrefix", "_creationTime"];
    }, {}, {}>;
    projects: import('convex/server').TableDefinition<import('convex/values').VObject<{
        description?: string | undefined;
        apiKeyId?: import('convex/values').GenericId<"apiKeys"> | undefined;
        enabledBoards?: string[] | undefined;
        name: string;
        slug: string;
        userId: string;
        createdAt: number;
        isPublicViewOnly: boolean;
        updatedAt: number;
    }, {
        userId: import('convex/values').VString<string, "required">;
        name: import('convex/values').VString<string, "required">;
        slug: import('convex/values').VString<string, "required">;
        description: import('convex/values').VString<string | undefined, "optional">;
        isPublicViewOnly: import('convex/values').VBoolean<boolean, "required">;
        apiKeyId: import('convex/values').VId<import('convex/values').GenericId<"apiKeys"> | undefined, "optional">;
        enabledBoards: import('convex/values').VArray<string[] | undefined, import('convex/values').VString<string, "required">, "optional">;
        createdAt: import('convex/values').VFloat64<number, "required">;
        updatedAt: import('convex/values').VFloat64<number, "required">;
    }, "required", "description" | "name" | "slug" | "userId" | "createdAt" | "isPublicViewOnly" | "apiKeyId" | "enabledBoards" | "updatedAt">, {
        byUserId: ["userId", "_creationTime"];
        byUserIdAndSlug: ["userId", "slug", "_creationTime"];
    }, {}, {}>;
    projectBoards: import('convex/server').TableDefinition<import('convex/values').VObject<{
        projectId: import('convex/values').GenericId<"projects">;
        name: string;
        createdAt: number;
        boardType: "feature-requests" | "bug-reports" | "internal-roadmap";
        isVisible: boolean;
        order: number;
    }, {
        projectId: import('convex/values').VId<import('convex/values').GenericId<"projects">, "required">;
        boardType: import('convex/values').VUnion<"feature-requests" | "bug-reports" | "internal-roadmap", [import('convex/values').VLiteral<"feature-requests", "required">, import('convex/values').VLiteral<"bug-reports", "required">, import('convex/values').VLiteral<"internal-roadmap", "required">], "required", never>;
        name: import('convex/values').VString<string, "required">;
        isVisible: import('convex/values').VBoolean<boolean, "required">;
        order: import('convex/values').VFloat64<number, "required">;
        createdAt: import('convex/values').VFloat64<number, "required">;
    }, "required", "projectId" | "name" | "createdAt" | "boardType" | "isVisible" | "order">, {
        byProjectId: ["projectId", "_creationTime"];
        byProjectIdAndType: ["projectId", "boardType", "_creationTime"];
    }, {}, {}>;
    projectColumns: import('convex/server').TableDefinition<import('convex/values').VObject<{
        boardId?: import('convex/values').GenericId<"projectBoards"> | undefined;
        projectId: import('convex/values').GenericId<"projects">;
        name: string;
        slug: string;
        createdAt: number;
        order: number;
        canAddItems: boolean;
    }, {
        projectId: import('convex/values').VId<import('convex/values').GenericId<"projects">, "required">;
        boardId: import('convex/values').VId<import('convex/values').GenericId<"projectBoards"> | undefined, "optional">;
        name: import('convex/values').VString<string, "required">;
        slug: import('convex/values').VString<string, "required">;
        order: import('convex/values').VFloat64<number, "required">;
        canAddItems: import('convex/values').VBoolean<boolean, "required">;
        createdAt: import('convex/values').VFloat64<number, "required">;
    }, "required", "projectId" | "name" | "slug" | "createdAt" | "order" | "boardId" | "canAddItems">, {
        byProjectId: ["projectId", "_creationTime"];
        byProjectIdAndOrder: ["projectId", "order", "_creationTime"];
        byBoardId: ["boardId", "_creationTime"];
    }, {}, {}>;
    projectItems: import('convex/server').TableDefinition<import('convex/values').VObject<{
        description?: string | undefined;
        boardId?: import('convex/values').GenericId<"projectBoards"> | undefined;
        createdByUserId?: string | undefined;
        createdByAdminId?: string | undefined;
        title: string;
        projectId: import('convex/values').GenericId<"projects">;
        status: "backlog" | "in-progress" | "review" | "done";
        createdAt: number;
        updatedAt: number;
        columnId: import('convex/values').GenericId<"projectColumns">;
        position: number;
        voteCount: number;
        commentCount: number;
    }, {
        projectId: import('convex/values').VId<import('convex/values').GenericId<"projects">, "required">;
        boardId: import('convex/values').VId<import('convex/values').GenericId<"projectBoards"> | undefined, "optional">;
        columnId: import('convex/values').VId<import('convex/values').GenericId<"projectColumns">, "required">;
        title: import('convex/values').VString<string, "required">;
        description: import('convex/values').VString<string | undefined, "optional">;
        createdByUserId: import('convex/values').VString<string | undefined, "optional">;
        createdByAdminId: import('convex/values').VString<string | undefined, "optional">;
        position: import('convex/values').VFloat64<number, "required">;
        voteCount: import('convex/values').VFloat64<number, "required">;
        commentCount: import('convex/values').VFloat64<number, "required">;
        status: import('convex/values').VUnion<"backlog" | "in-progress" | "review" | "done", [import('convex/values').VLiteral<"backlog", "required">, import('convex/values').VLiteral<"in-progress", "required">, import('convex/values').VLiteral<"review", "required">, import('convex/values').VLiteral<"done", "required">], "required", never>;
        createdAt: import('convex/values').VFloat64<number, "required">;
        updatedAt: import('convex/values').VFloat64<number, "required">;
    }, "required", "title" | "projectId" | "description" | "status" | "createdAt" | "updatedAt" | "boardId" | "columnId" | "createdByUserId" | "createdByAdminId" | "position" | "voteCount" | "commentCount">, {
        byProjectId: ["projectId", "_creationTime"];
        byColumnId: ["columnId", "_creationTime"];
        byProjectIdAndColumnId: ["projectId", "columnId", "_creationTime"];
        byBoardId: ["boardId", "_creationTime"];
        byCreatedByUserId: ["createdByUserId", "_creationTime"];
    }, {}, {}>;
    projectVotes: import('convex/server').TableDefinition<import('convex/values').VObject<{
        projectId: import('convex/values').GenericId<"projects">;
        itemId: import('convex/values').GenericId<"projectItems">;
        clerkUserId: string;
        createdAt: number;
    }, {
        itemId: import('convex/values').VId<import('convex/values').GenericId<"projectItems">, "required">;
        clerkUserId: import('convex/values').VString<string, "required">;
        projectId: import('convex/values').VId<import('convex/values').GenericId<"projects">, "required">;
        createdAt: import('convex/values').VFloat64<number, "required">;
    }, "required", "projectId" | "itemId" | "clerkUserId" | "createdAt">, {
        byItemId: ["itemId", "_creationTime"];
        byClerkUserId: ["clerkUserId", "_creationTime"];
        byItemIdAndClerkUserId: ["itemId", "clerkUserId", "_creationTime"];
        byProjectId: ["projectId", "_creationTime"];
    }, {}, {}>;
    projectCustomization: import('convex/server').TableDefinition<import('convex/values').VObject<{
        darkPrimaryColor?: string | undefined;
        darkSecondaryColor?: string | undefined;
        darkBackgroundColor?: string | undefined;
        darkCardBackgroundColor?: string | undefined;
        darkTextColor?: string | undefined;
        darkBorderColor?: string | undefined;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        backgroundColor?: string | undefined;
        cardBackgroundColor?: string | undefined;
        textColor?: string | undefined;
        borderColor?: string | undefined;
        fontFamily?: string | undefined;
        fontSize?: string | undefined;
        headingFontFamily?: string | undefined;
        borderRadius?: string | undefined;
        spacing?: string | undefined;
        customCss?: string | undefined;
        logoUrl?: string | undefined;
        companyName?: string | undefined;
        widgetTitle?: string | undefined;
        projectId: import('convex/values').GenericId<"projects">;
        createdAt: number;
        updatedAt: number;
    }, {
        projectId: import('convex/values').VId<import('convex/values').GenericId<"projects">, "required">;
        logoUrl: import('convex/values').VString<string | undefined, "optional">;
        companyName: import('convex/values').VString<string | undefined, "optional">;
        widgetTitle: import('convex/values').VString<string | undefined, "optional">;
        primaryColor: import('convex/values').VString<string | undefined, "optional">;
        secondaryColor: import('convex/values').VString<string | undefined, "optional">;
        backgroundColor: import('convex/values').VString<string | undefined, "optional">;
        cardBackgroundColor: import('convex/values').VString<string | undefined, "optional">;
        textColor: import('convex/values').VString<string | undefined, "optional">;
        borderColor: import('convex/values').VString<string | undefined, "optional">;
        darkPrimaryColor: import('convex/values').VString<string | undefined, "optional">;
        darkSecondaryColor: import('convex/values').VString<string | undefined, "optional">;
        darkBackgroundColor: import('convex/values').VString<string | undefined, "optional">;
        darkCardBackgroundColor: import('convex/values').VString<string | undefined, "optional">;
        darkTextColor: import('convex/values').VString<string | undefined, "optional">;
        darkBorderColor: import('convex/values').VString<string | undefined, "optional">;
        fontFamily: import('convex/values').VString<string | undefined, "optional">;
        fontSize: import('convex/values').VString<string | undefined, "optional">;
        headingFontFamily: import('convex/values').VString<string | undefined, "optional">;
        borderRadius: import('convex/values').VString<string | undefined, "optional">;
        spacing: import('convex/values').VString<string | undefined, "optional">;
        customCss: import('convex/values').VString<string | undefined, "optional">;
        updatedAt: import('convex/values').VFloat64<number, "required">;
        createdAt: import('convex/values').VFloat64<number, "required">;
    }, "required", "projectId" | "darkPrimaryColor" | "darkSecondaryColor" | "darkBackgroundColor" | "darkCardBackgroundColor" | "darkTextColor" | "darkBorderColor" | "primaryColor" | "secondaryColor" | "backgroundColor" | "cardBackgroundColor" | "textColor" | "borderColor" | "fontFamily" | "fontSize" | "headingFontFamily" | "borderRadius" | "spacing" | "customCss" | "createdAt" | "updatedAt" | "logoUrl" | "companyName" | "widgetTitle">, {
        byProjectId: ["projectId", "_creationTime"];
    }, {}, {}>;
    projectComments: import('convex/server').TableDefinition<import('convex/values').VObject<{
        parentCommentId?: import('convex/values').GenericId<"projectComments"> | undefined;
        projectId: import('convex/values').GenericId<"projects">;
        itemId: import('convex/values').GenericId<"projectItems">;
        content: string;
        createdAt: number;
        updatedAt: number;
        authorId: string;
        authorType: "admin" | "user";
        isDeleted: boolean;
    }, {
        itemId: import('convex/values').VId<import('convex/values').GenericId<"projectItems">, "required">;
        projectId: import('convex/values').VId<import('convex/values').GenericId<"projects">, "required">;
        authorId: import('convex/values').VString<string, "required">;
        authorType: import('convex/values').VUnion<"admin" | "user", [import('convex/values').VLiteral<"admin", "required">, import('convex/values').VLiteral<"user", "required">], "required", never>;
        content: import('convex/values').VString<string, "required">;
        parentCommentId: import('convex/values').VId<import('convex/values').GenericId<"projectComments"> | undefined, "optional">;
        isDeleted: import('convex/values').VBoolean<boolean, "required">;
        createdAt: import('convex/values').VFloat64<number, "required">;
        updatedAt: import('convex/values').VFloat64<number, "required">;
    }, "required", "projectId" | "itemId" | "content" | "createdAt" | "updatedAt" | "authorId" | "authorType" | "parentCommentId" | "isDeleted">, {
        byItemId: ["itemId", "_creationTime"];
        byProjectId: ["projectId", "_creationTime"];
        byAuthorId: ["authorId", "_creationTime"];
        byParentCommentId: ["parentCommentId", "_creationTime"];
        byItemIdAndCreatedAt: ["itemId", "createdAt", "_creationTime"];
    }, {}, {}>;
    projectAnalytics: import('convex/server').TableDefinition<import('convex/values').VObject<{
        projectId: import('convex/values').GenericId<"projects">;
        date: string;
        createdAt: number;
        totalItems: number;
        totalVotes: number;
        totalComments: number;
        activeUsers: number;
        newItemsCount: number;
        newVotesCount: number;
        newCommentsCount: number;
        itemsBacklog: number;
        itemsInProgress: number;
        itemsReview: number;
        itemsDone: number;
    }, {
        projectId: import('convex/values').VId<import('convex/values').GenericId<"projects">, "required">;
        date: import('convex/values').VString<string, "required">;
        totalItems: import('convex/values').VFloat64<number, "required">;
        totalVotes: import('convex/values').VFloat64<number, "required">;
        totalComments: import('convex/values').VFloat64<number, "required">;
        activeUsers: import('convex/values').VFloat64<number, "required">;
        newItemsCount: import('convex/values').VFloat64<number, "required">;
        newVotesCount: import('convex/values').VFloat64<number, "required">;
        newCommentsCount: import('convex/values').VFloat64<number, "required">;
        itemsBacklog: import('convex/values').VFloat64<number, "required">;
        itemsInProgress: import('convex/values').VFloat64<number, "required">;
        itemsReview: import('convex/values').VFloat64<number, "required">;
        itemsDone: import('convex/values').VFloat64<number, "required">;
        createdAt: import('convex/values').VFloat64<number, "required">;
    }, "required", "projectId" | "date" | "createdAt" | "totalItems" | "totalVotes" | "totalComments" | "activeUsers" | "newItemsCount" | "newVotesCount" | "newCommentsCount" | "itemsBacklog" | "itemsInProgress" | "itemsReview" | "itemsDone">, {
        byProjectId: ["projectId", "_creationTime"];
        byProjectIdAndDate: ["projectId", "date", "_creationTime"];
    }, {}, {}>;
}, true>;
export default _default;
