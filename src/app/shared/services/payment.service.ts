import http from "@/app/shared/services/base.service";

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

export class PaymentService {
    private getPath(action: string): string {
        // Goes from /api/v1 to /api/payments/
        return `../payments/${action}`;
    }

    async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
        const { data } = await http.post(this.getPath('create'), request);
        return data;
    }

    async captureOrder(orderId: string): Promise<CaptureOrderResponse> {
        const { data } = await http.post(this.getPath('capture'), { orderId });
        return data;
    }

    async getBalance(): Promise<BalanceResponse> {
        const { data } = await http.get(this.getPath('balance'));
        return data;
    }
}

export const paymentService = new PaymentService();
