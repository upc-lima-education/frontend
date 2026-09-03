import http from '@/app/shared/services/base.service';

export type PaidCreditPlan = 'Starter' | 'Pro' | 'Max';

export interface CreateOrderRequest {
    creditPlan: PaidCreditPlan;
    platform: 'Paypal';
    returnUrl: string;
    cancelUrl: string;
}

export interface CreateOrderResponse {
    orderId: string;
    approvalUrl: string;
}

export interface CaptureOrderResponse {
    success: boolean;
    creditsAdded: number;
    newBalance: number;
    transactionId: string | null;
}

/** Contract returned by GET /api/payments/plans. */
export interface CreditPlanResponse {
    code: string;
    name: string;
    description: string;
    credits: number;
    price: number;
    currency: string;
    requiresPayment: boolean;
}

/** Contract returned by GET /api/payments/balance. */
export interface CreditBalanceResponse {
    balance: number;
    initialFreeCredits: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const API_ROOT = API_BASE_URL.replace(/\/api\/v\d+\/?$/, '/api');
const PAYMENT_ENDPOINT = `${API_ROOT}/payments`;

/**
 * Payment calls deliberately reuse the shared HTTP client so the access-token
 * refresh flow works exactly as it does for the versioned API endpoints.
 */
export class PaymentService {
    async getPlans(): Promise<CreditPlanResponse[]> {
        const { data } = await http.get<CreditPlanResponse[]>(`${PAYMENT_ENDPOINT}/plans`);
        return Array.isArray(data) ? data : [];
    }

    async getBalance(): Promise<CreditBalanceResponse> {
        const { data } = await http.get<CreditBalanceResponse>(`${PAYMENT_ENDPOINT}/balance`);
        return data;
    }

    async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
        const { data } = await http.post<CreateOrderResponse>(`${PAYMENT_ENDPOINT}/create`, request);
        return data;
    }

    async captureOrder(orderId: string): Promise<CaptureOrderResponse> {
        const { data } = await http.post<CaptureOrderResponse>(
            `${PAYMENT_ENDPOINT}/capture/${encodeURIComponent(orderId)}`,
        );
        return data;
    }
}

export const paymentService = new PaymentService();
