const API_BASE_URL =
	(import.meta as unknown as { env: { VITE_API_URL?: string } }).env
		.VITE_API_URL || "http://localhost:5000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		method: (options.method || "GET") as HttpMethod,
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `Bearer ${token}` }),
			...options.headers,
		},
		credentials: "include",
	});

	if (!response.ok) {
		const errorBody = await response.json().catch(() => ({}));
		const message =
			(errorBody as { message?: string }).message ||
			`Request failed with status ${response.status}`;
		throw new Error(message);
	}

	return response.json();
}

export const authAPI = {
	login: (email: string, password: string) =>
		apiRequest<{ token: string; user: unknown }>("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		}),
	register: (userData: { email: string; password: string; name?: string }) =>
		apiRequest<{ token: string; user: unknown }>("/auth/register", {
			method: "POST",
			body: JSON.stringify(userData),
		}),
};

export const productAPI = {
	getAll: () => apiRequest<unknown[]>("/products"),
	getById: (id: string) => apiRequest<unknown>(`/products/${id}`),
	create: (productData: unknown) =>
		apiRequest<unknown>("/products", {
			method: "POST",
			body: JSON.stringify(productData),
		}),
	update: (id: string, productData: unknown) =>
		apiRequest<unknown>(`/products/${id}`, {
			method: "PUT",
			body: JSON.stringify(productData),
		}),
	delete: (id: string) =>
		apiRequest<void>(`/products/${id}`, { method: "DELETE" }),
};

export const orderAPI = {
	getAll: () => apiRequest<unknown[]>("/orders"),
	getById: (id: string) => apiRequest<unknown>(`/orders/${id}`),
};

export const checkoutAPI = {
	createSession: (items: unknown[]) =>
		apiRequest<{ sessionId: string; url: string }>("/checkout/session", {
			method: "POST",
			body: JSON.stringify({ items }),
		}),
};