export declare const savePaymentAttempt: import('convex/server').RegisteredMutation<"internal", {
    paymentAttemptData: {
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
    };
}, Promise<null>>;
