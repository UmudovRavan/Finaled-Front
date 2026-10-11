import httpClient from './httpClient';
import type {
    SalesOrderDto,
    CreateSalesOrderDto,
    DeliveryNoteDto,
    CreateDeliveryNoteDto,
} from '../dto';

export const salesService = {
    // -------------------------------------------------------------
    // Satış Sifarişləri (Sales Orders)
    // -------------------------------------------------------------
    async getOrders(): Promise<SalesOrderDto[]> {
        const response = await httpClient.get<SalesOrderDto[]>('/sales/orders');
        return response.data || [];
    },

    async getOrderById(orderId: string): Promise<SalesOrderDto> {
        const response = await httpClient.get<SalesOrderDto>(`/sales/orders/${orderId}`);
        return response.data;
    },

    async createOrder(data: CreateSalesOrderDto): Promise<SalesOrderDto> {
        const response = await httpClient.post<SalesOrderDto>('/sales/orders', data);
        return response.data;
    },

    async confirmOrder(orderId: string): Promise<SalesOrderDto> {
        const response = await httpClient.post<SalesOrderDto>(`/sales/orders/${orderId}/confirm`);
        return response.data;
    },

    async cancelOrder(orderId: string): Promise<SalesOrderDto> {
        const response = await httpClient.post<SalesOrderDto>(`/sales/orders/${orderId}/cancel`);
        return response.data;
    },

    // -------------------------------------------------------------
    // Mal Göndərişi / Təhvil İrsaliyyəsi (Delivery Notes)
    // -------------------------------------------------------------
    async getDeliveries(): Promise<DeliveryNoteDto[]> {
        const response = await httpClient.get<DeliveryNoteDto[]>('/sales/deliveries');
        return response.data || [];
    },

    async getDeliveryById(deliveryId: string): Promise<DeliveryNoteDto> {
        const response = await httpClient.get<DeliveryNoteDto>(`/sales/deliveries/${deliveryId}`);
        return response.data;
    },

    async createDelivery(data: CreateDeliveryNoteDto): Promise<DeliveryNoteDto> {
        const response = await httpClient.post<DeliveryNoteDto>('/sales/deliveries', data);
        return response.data;
    },

    async postDelivery(deliveryId: string): Promise<DeliveryNoteDto> {
        const response = await httpClient.post<DeliveryNoteDto>(`/sales/deliveries/${deliveryId}/post`);
        return response.data;
    },
};

export default salesService;
