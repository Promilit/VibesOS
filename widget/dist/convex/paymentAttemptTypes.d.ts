export declare const paymentAttemptValidators: {
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
};
export declare const paymentAttemptDataValidator: import('convex/values').VObject<{
    failed_at?: number | undefined;
    failed_reason?: {
        decline_code?: string | undefined;
        code: string;
    } | undefined;
    paid_at?: number | undefined;
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
}, "required", "status" | "billing_date" | "charge_type" | "created_at" | "failed_at" | "failed_reason" | "invoice_id" | "paid_at" | "payment_id" | "statement_id" | "updated_at" | "payer" | "payment_source" | "subscription_items" | "totals" | "failed_reason.code" | "failed_reason.decline_code" | "payer.email" | "payer.first_name" | "payer.last_name" | "payer.user_id" | "payment_source.card_type" | "payment_source.last4" | "totals.grand_total" | "totals.subtotal" | "totals.tax_total" | "totals.grand_total.amount" | "totals.grand_total.amount_formatted" | "totals.grand_total.currency" | "totals.grand_total.currency_symbol" | "totals.subtotal.amount" | "totals.subtotal.amount_formatted" | "totals.subtotal.currency" | "totals.subtotal.currency_symbol" | "totals.tax_total.amount" | "totals.tax_total.amount_formatted" | "totals.tax_total.currency" | "totals.tax_total.currency_symbol">;
export declare const paymentAttemptSchemaValidator: import('convex/values').VObject<{
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
}, "required", "status" | "billing_date" | "charge_type" | "created_at" | "failed_at" | "failed_reason" | "invoice_id" | "paid_at" | "payment_id" | "statement_id" | "updated_at" | "payer" | "payment_source" | "subscription_items" | "totals" | "failed_reason.code" | "failed_reason.decline_code" | "payer.email" | "payer.first_name" | "payer.last_name" | "payer.user_id" | "payment_source.card_type" | "payment_source.last4" | "totals.grand_total" | "totals.subtotal" | "totals.tax_total" | "totals.grand_total.amount" | "totals.grand_total.amount_formatted" | "totals.grand_total.currency" | "totals.grand_total.currency_symbol" | "totals.subtotal.amount" | "totals.subtotal.amount_formatted" | "totals.subtotal.currency" | "totals.subtotal.currency_symbol" | "totals.tax_total.amount" | "totals.tax_total.amount_formatted" | "totals.tax_total.currency" | "totals.tax_total.currency_symbol" | "userId">;
export declare function transformWebhookData(data: any): {
    billing_date: any;
    charge_type: any;
    created_at: any;
    failed_at: any;
    failed_reason: any;
    invoice_id: any;
    paid_at: any;
    payment_id: any;
    statement_id: any;
    status: any;
    updated_at: any;
    payer: {
        email: any;
        first_name: any;
        last_name: any;
        user_id: any;
    };
    payment_source: {
        card_type: any;
        last4: any;
    };
    subscription_items: any;
    totals: {
        grand_total: {
            amount: any;
            amount_formatted: any;
            currency: any;
            currency_symbol: any;
        };
        subtotal: {
            amount: any;
            amount_formatted: any;
            currency: any;
            currency_symbol: any;
        };
        tax_total: {
            amount: any;
            amount_formatted: any;
            currency: any;
            currency_symbol: any;
        };
    };
};
