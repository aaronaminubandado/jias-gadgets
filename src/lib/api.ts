// API Configuration
const getApiBaseUrl = () => {
	// Check for environment variable first
	const envUrl = (
		import.meta as unknown as { env: { VITE_API_URL?: string } }
	).env?.VITE_API_URL;
	
	if (envUrl) return envUrl;
	
	// Fallback to localhost for development
	return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestOptions extends RequestInit {
	requireAuth?: boolean; // If false, don't require auth (still sends token when attachAuthIfPresent)
	attachAuthIfPresent?: boolean; // Send Bearer token when available (guest checkout + logged-in)
}

async function apiRequest<T>(
	endpoint: string,
	options: ApiRequestOptions = {}
): Promise<T> {
	const { requireAuth = true, attachAuthIfPresent = false, ...fetchOptions } = options;
	const token = localStorage.getItem("token");

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		...fetchOptions.headers,
	};

	if (token && (requireAuth || attachAuthIfPresent)) {
		(headers as Record<string, string>)[
			"Authorization"
		] = `Bearer ${token}`;
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...fetchOptions,
		method: (fetchOptions.method || "GET") as HttpMethod,
		headers,
		credentials: "include",
	});

	if (!response.ok) {
		const errorBody = await response.json().catch(() => ({}));
		const message =
			(errorBody as { message?: string; error?: string }).message ||
			(errorBody as { message?: string; error?: string }).error ||
			`Request failed with status ${response.status}`;
		throw new Error(message);
	}

	// Handle empty responses (e.g., 204 No Content)
	const text = await response.text();
	return text ? JSON.parse(text) : undefined;
}

// Auth API Types
export interface LoginResponse {
	token: string;
	email: string;
	role: string;
}

export interface RegisterResponse {
	token: string;
	email: string;
	role: string;
}

// Product API Types
export interface BackendProduct {
	_id: string;
	name: string;
	price: number;
	stock: number;
	reserved: number;
	category: string;
	description: string;
	image?: string;
	sku?: string;
	brand?: string;
	tags?: string[];
	featured?: boolean;
	createdAt: string;
	updatedAt: string;
}

// Order API Types
export interface OrderProduct {
	productId: string;
	name?: string;
	image?: string;
	quantity: number;
	priceCents: number;
	price: number;
}

export interface ShippingAddress {
	line1: string;
	line2?: string;
	city: string;
	state?: string;
	postalCode: string;
	country: string;
}

export type FulfillmentStatus =
	| 'awaiting_payment'
	| 'awaiting_fulfillment'
	| 'ready_for_pickup'
	| 'out_for_delivery'
	| 'completed'
	| 'cancelled';

export interface Order {
	id: string;
	products: OrderProduct[];
	totalAmount: number | null;
	totalAmountCents: number | null;
	currency: string;
	status: string;
	fulfillmentStatus?: FulfillmentStatus;
	fulfillmentMethod?: 'pickup' | 'delivery' | null;
	customerName?: string | null;
	phone?: string | null;
	customerEmail?: string | null;
	userId?: string | null;
	shippingAddress?: ShippingAddress | null;
	notes?: string | null;
	createdAt: string;
	updatedAt: string;
	paymentIntentId?: string | null;
	checkoutSessionId?: string | null;
	user?: string | null;
}

export interface OrdersQuery {
	page?: number;
	limit?: number;
	status?: string;
	fulfillmentStatus?: FulfillmentStatus;
}

export interface OrdersResponse {
	data: Order[];
	meta: {
		total: number;
		page: number;
		limit: number;
	};
}

export interface OrderResponse {
	data: Order;
}

// Checkout API Types
export interface CheckoutItem {
	id: string;
	quantity: number;
}

export type FulfillmentMethod = 'pickup' | 'delivery';

export interface CheckoutFulfillment {
	fulfillmentMethod: FulfillmentMethod;
	customerName: string;
	phone: string;
	shippingAddress?: ShippingAddress;
	notes?: string;
}

export interface CheckoutRequest {
	items: CheckoutItem[];
	fulfillmentMethod: FulfillmentMethod;
	customerName: string;
	phone: string;
	shippingAddress?: ShippingAddress;
	notes?: string;
}

export interface CheckoutResponse {
	url: string;
}

export interface ConfirmCheckoutResponse {
	data: Order;
}

export interface StaffMetrics {
	totalOrders: number;
	paidOrders: number;
	revenueTotal: number;
	ordersLast7Days: number;
	productCount: number;
	lowStockProducts: Array<{ id: string; name: string; stock: number }>;
}

// Auth API
export const authAPI = {
	login: (email: string, password: string) =>
		apiRequest<LoginResponse>("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
			requireAuth: false,
		}),
	register: (userData: { email: string; password: string }) =>
		apiRequest<RegisterResponse>("/auth/register", {
			method: "POST",
			body: JSON.stringify(userData),
			requireAuth: false,
		}),
};

// Product API
export const productAPI = {
	getAll: () => apiRequest<BackendProduct[]>("/products", { requireAuth: false }),
	getById: (id: string) =>
		apiRequest<BackendProduct>(`/products/${id}`, { requireAuth: false }),
	create: (productData: FormData | Record<string, unknown>) => {
		const isFormData = productData instanceof FormData;
		const token = localStorage.getItem("token");
		
		const headers: HeadersInit = {};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
		// Don't set Content-Type for FormData - browser will set it with boundary
		if (!isFormData) {
			headers["Content-Type"] = "application/json";
		}

		return fetch(`${API_BASE_URL}/products`, {
			method: "POST",
			headers,
			credentials: "include",
			body: isFormData ? productData : JSON.stringify(productData),
		}).then(async (response) => {
			if (!response.ok) {
				const errorBody = await response.json().catch(() => ({}));
				const message =
					(errorBody as { message?: string; error?: string }).message ||
					(errorBody as { message?: string; error?: string }).error ||
					`Request failed with status ${response.status}`;
				throw new Error(message);
			}
			return response.json();
		}) as Promise<BackendProduct>;
	},
	update: (id: string, productData: FormData | Record<string, unknown>) => {
		const isFormData = productData instanceof FormData;
		const token = localStorage.getItem("token");
		
		const headers: HeadersInit = {};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}
		if (!isFormData) {
			headers["Content-Type"] = "application/json";
		}

		return fetch(`${API_BASE_URL}/products/${id}`, {
			method: "PUT",
			headers,
			credentials: "include",
			body: isFormData ? productData : JSON.stringify(productData),
		}).then(async (response) => {
			if (!response.ok) {
				const errorBody = await response.json().catch(() => ({}));
				const message =
					(errorBody as { message?: string; error?: string }).message ||
					(errorBody as { message?: string; error?: string }).error ||
					`Request failed with status ${response.status}`;
				throw new Error(message);
			}
			return response.json();
		}) as Promise<BackendProduct>;
	},
	delete: (id: string) =>
		apiRequest<void>(`/products/${id}`, { method: "DELETE" }),
};

// Order API
export const orderAPI = {
	getAll: (query: OrdersQuery = {}) => {
		const params = new URLSearchParams();
		if (query.page) params.append("page", query.page.toString());
		if (query.limit) params.append("limit", query.limit.toString());
		if (query.status) params.append("status", query.status);
		if (query.fulfillmentStatus) {
			params.append("fulfillmentStatus", query.fulfillmentStatus);
		}
		const qs = params.toString() ? `?${params.toString()}` : "";
		return apiRequest<OrdersResponse>(`/orders${qs}`);
	},
	getById: (id: string) => apiRequest<OrderResponse>(`/orders/${id}`),
	updateFulfillment: (id: string, fulfillmentStatus: FulfillmentStatus) =>
		apiRequest<OrderResponse>(`/orders/${id}/fulfillment`, {
			method: "PATCH",
			body: JSON.stringify({ fulfillmentStatus }),
		}),
};

// Checkout API - Guest checkout supported (no auth required)
export const checkoutAPI = {
	createSession: (payload: CheckoutRequest) =>
		apiRequest<CheckoutResponse>("/checkout", {
			method: "POST",
			body: JSON.stringify(payload),
			requireAuth: false,
			attachAuthIfPresent: true,
		}),
	confirmSession: (sessionId: string) =>
		apiRequest<ConfirmCheckoutResponse>("/checkout/confirm", {
			method: "POST",
			body: JSON.stringify({ sessionId }),
			requireAuth: false,
			attachAuthIfPresent: true,
		}),
	cancelSession: (sessionId: string) =>
		apiRequest<OrderResponse>("/checkout/cancel", {
			method: "POST",
			body: JSON.stringify({ sessionId }),
			requireAuth: false,
			attachAuthIfPresent: true,
		}),
};

// Staff API
export const staffAPI = {
	getMetrics: () => apiRequest<StaffMetrics>("/staff/metrics"),
};