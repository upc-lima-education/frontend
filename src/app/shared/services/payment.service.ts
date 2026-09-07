import http from '@/app/shared/services/base.service';

export type CreditPlanCode = 'Free' | 'Starter' | 'Pro' | 'Max';
export type PaidCreditPlan = Exclude<CreditPlanCode, 'Free'>;
export type PaymentPlatform = 'Paypal';

export interface CreateOrderRequest {
    creditPlan: PaidCreditPlan;
    platform: PaymentPlatform;
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

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api/v1';
const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;

/**
 * Payments is intentionally exposed by the backend at /api/payments (without
 * the /api/v1 prefix used by the rest of the API). Keep this conversion in
 * one place so local and deployed VITE_API_URL values behave consistently.
 */
function resolvePaymentsEndpoint(apiBaseUrl: string): string {
    const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, '');
    const apiRoot = normalizedBaseUrl.replace(/\/api\/v\d+$/i, '/api');
    return `${apiRoot}/payments`;
}

export const PAYMENT_ENDPOINT = resolvePaymentsEndpoint(API_BASE_URL);

const PAID_PLANS: readonly PaidCreditPlan[] = ['Starter', 'Pro', 'Max'];

export function isPaidCreditPlan(value: string): value is PaidCreditPlan {
    return PAID_PLANS.includes(value as PaidCreditPlan);
}

function assertValidCreateOrderRequest(request: CreateOrderRequest): void {
    if (!isPaidCreditPlan(request.creditPlan)) {
        throw new Error('Solo se pueden comprar los planes Starter, Pro o Max.');
    }

    if (request.platform !== 'Paypal') {
        throw new Error('La plataforma de pago disponible es PayPal.');
    }

    for (const callbackUrl of [request.returnUrl, request.cancelUrl]) {
        try {
            const parsedUrl = new URL(callbackUrl);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new Error();
            }
        } catch {
            throw new Error('Las URLs de retorno del pago no son válidas.');
        }
    }
}

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
        assertValidCreateOrderRequest(request);
        const { data } = await http.post<CreateOrderResponse>(`${PAYMENT_ENDPOINT}/create`, request);
        return data;
    }

    async captureOrder(orderId: string): Promise<CaptureOrderResponse> {
        if (!orderId.trim()) {
            throw new Error('No se recibió el identificador de la orden de PayPal.');
        }

        const { data } = await http.post<CaptureOrderResponse>(
            `${PAYMENT_ENDPOINT}/capture/${encodeURIComponent(orderId)}`,
        );
        return data;
    }
}

export const paymentService = new PaymentService();
