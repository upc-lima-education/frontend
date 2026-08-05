import axios from "axios";
import { authenticationInterceptor } from "@/app/auth/services/authentication.interceptor";

export interface CreateOrderRequest {
    planName: string;
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
    transactionId: string;
}

export interface BalanceResponse {
    userId: string;
    balance: number;
}

// El API_URL apunta a /api/v1 (recursos versionados), pero /payments vive
// directamente bajo /api (sin versión). Se deriva el origen explícitamente
// en vez de usar rutas relativas (`../payments`), que dependían de la
// normalización de URL de axios y se rompían si VITE_API_URL cambiaba de forma.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5155/api/v1";
const API_ROOT = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "/api");

const paymentHttp = axios.create({
    baseURL: API_ROOT,
    headers: { 'Content-Type': 'application/json' }
});
paymentHttp.interceptors.request.use(authenticationInterceptor);

export class PaymentService {
    private endpoint = '/payments';

    async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
        const { data } = await paymentHttp.post(`${this.endpoint}/create`, request);
        return data;
    }

    async captureOrder(orderId: string): Promise<CaptureOrderResponse> {
        const { data } = await paymentHttp.post(`${this.endpoint}/capture`, { orderId });
        return data;
    }

    async getBalance(): Promise<BalanceResponse> {
        const { data } = await paymentHttp.get(`${this.endpoint}/balance`);
        return data;
    }
}

export const paymentService = new PaymentService();
