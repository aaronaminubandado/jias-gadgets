import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Package,
	DollarSign,
	TrendingUp,
	Store,
	CreditCard,
	ArrowLeft,
	Loader2,
	FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { orderAPI, productAPI, OrdersResponse, BackendProduct } from "@/lib/api";
import { Header } from "@/components/ecommerce/Header";

const AdminDashboard = () => {
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [orders, setOrders] = useState<OrdersResponse | null>(null);
	const [products, setProducts] = useState<BackendProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(50);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}

		if (user?.role !== "admin") {
			toast({
				title: "Access Denied",
				description: "This page is for administrators only",
				variant: "destructive",
			});
			navigate("/");
			return;
		}

		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated, user?.role, navigate, page]);

	const loadData = async () => {
		try {
			setIsLoading(true);
			const [ordersData, productsData] = await Promise.all([
				orderAPI.getAll(page, pageSize),
				productAPI.getAll(),
			]);

			setOrders(ordersData);
			setProducts(productsData);
			// Calculate total pages based on meta.total and pageSize
			if (ordersData.meta.total) {
				setTotalPages(Math.ceil(ordersData.meta.total / pageSize));
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to load dashboard data";
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (!isAuthenticated || user?.role !== "admin") {
		return null;
	}

	// Calculate platform statistics
	const totalRevenue =
		orders?.data.reduce((sum, order) => sum + (order.totalAmount || 0), 0) ||
		0;
	const totalOrders = orders?.meta.total || 0;
	const totalProducts = products.length;
	const completedOrders =
		orders?.data.filter((o) => o.status === "completed" || o.status === "paid")
			.length || 0;

	// Group orders by store (for remittance tracking)
	const ordersByStore = new Map<string, { orders: number; revenue: number }>();
	orders?.data.forEach((order) => {
		// This would need to be enhanced with actual store data from backend
		// For now, we'll show the structure
		const storeId = "all"; // Placeholder - would come from order.store or product.store
		const current = ordersByStore.get(storeId) || { orders: 0, revenue: 0 };
		ordersByStore.set(storeId, {
			orders: current.orders + 1,
			revenue: current.revenue + (order.totalAmount || 0),
		});
	});

	return (
		<div className="min-h-screen bg-gradient-background">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="mb-6">
					<Button
						variant="ghost"
						onClick={() => navigate("/")}
						className="mb-4"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Store
					</Button>
					<h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
					<p className="text-muted-foreground">
						Platform management and multi-vendor oversight
					</p>
				</div>

				{/* Platform Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<DollarSign className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium text-muted-foreground">
									Total Revenue
								</span>
							</div>
							<div className="text-2xl font-bold">
								${totalRevenue.toFixed(2)}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<TrendingUp className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium text-muted-foreground">
									Total Orders
								</span>
							</div>
							<div className="text-2xl font-bold">{totalOrders}</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<Package className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium text-muted-foreground">
									Total Products
								</span>
							</div>
							<div className="text-2xl font-bold">{totalProducts}</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<CreditCard className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium text-muted-foreground">
									Completed Orders
								</span>
							</div>
							<div className="text-2xl font-bold">{completedOrders}</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Tabs */}
				<Tabs defaultValue="orders" className="space-y-6">
					<TabsList>
						<TabsTrigger value="orders">
							<FileText className="w-4 h-4 mr-2" />
							All Orders
						</TabsTrigger>
						<TabsTrigger value="payments">
							<CreditCard className="w-4 h-4 mr-2" />
							Payment Tracking
						</TabsTrigger>
						<TabsTrigger value="remittance">
							<Store className="w-4 h-4 mr-2" />
							Store Remittance
						</TabsTrigger>
						<TabsTrigger value="products">
							<Package className="w-4 h-4 mr-2" />
							All Products
						</TabsTrigger>
					</TabsList>

					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
							<span className="ml-2 text-muted-foreground">
								Loading...
							</span>
						</div>
					) : (
						<>
							<TabsContent value="orders">
								<Card>
									<CardHeader>
										<CardTitle>All Orders</CardTitle>
										<CardDescription>
											View and manage all orders across the platform
										</CardDescription>
									</CardHeader>
									<CardContent>
										{!orders || orders.data.length === 0 ? (
											<div className="text-center py-12">
												<FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
												<p className="text-lg font-semibold mb-2">
													No orders yet
												</p>
											</div>
										) : (
											<div className="space-y-4">
												{orders.data.map((order) => (
													<div
														key={order.id}
														className="p-4 border rounded-lg"
													>
														<div className="flex items-center justify-between mb-2">
															<div>
																<p className="font-semibold">
																	Order #{order.id.slice(-8).toUpperCase()}
																</p>
																<p className="text-sm text-muted-foreground">
																	{new Date(
																		order.createdAt
																	).toLocaleDateString()}
																</p>
															</div>
															<div className="text-right">
																<p className="font-semibold">
																	${order.totalAmount?.toFixed(2) || "0.00"}
																</p>
																<Badge>{order.status}</Badge>
															</div>
														</div>
														<div className="mt-2">
															<p className="text-sm text-muted-foreground">
																{order.products?.length || 0} item(s)
															</p>
														</div>
													</div>
												))}
												{/* Pagination Controls */}
												{totalPages > 1 && (
													<div className="flex items-center justify-center gap-2 pt-4 border-t">
														<Button
															variant="outline"
															onClick={() =>
																setPage((p) => Math.max(1, p - 1))
															}
															disabled={page === 1 || isLoading}
														>
															Previous
														</Button>
														<span className="text-sm text-muted-foreground">
															Page {page} of {totalPages}
															{orders?.meta.total && (
																<> ({orders.meta.total} total orders)</>
															)}
														</span>
														<Button
															variant="outline"
															onClick={() =>
																setPage((p) =>
																	Math.min(totalPages, p + 1)
																)
															}
															disabled={page === totalPages || isLoading}
														>
															Next
														</Button>
													</div>
												)}
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="payments">
								<Card>
									<CardHeader>
										<CardTitle>Payment Tracking</CardTitle>
										<CardDescription>
											Monitor payment status and Stripe transactions
										</CardDescription>
									</CardHeader>
									<CardContent>
										{(() => {
											const ordersWithPayments = orders?.data.filter(
												(o) => o.paymentIntentId || o.checkoutSessionId
											) || [];

											if (ordersWithPayments.length === 0) {
												return (
													<div className="text-center py-12">
														<CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
														<p className="text-lg font-semibold mb-2">
															No payment records
														</p>
													</div>
												);
											}

											return (
												<div className="space-y-4">
													{ordersWithPayments.map((order) => (
														<div
															key={order.id}
															className="p-4 border rounded-lg"
														>
															<div className="flex items-center justify-between">
																<div>
																	<p className="font-semibold">
																		Order #{order.id.slice(-8).toUpperCase()}
																	</p>
																	<p className="text-sm text-muted-foreground">
																		{order.paymentIntentId && (
																			<span>
																				Payment Intent:{" "}
																				{order.paymentIntentId.slice(-12)}
																			</span>
																		)}
																		{order.checkoutSessionId && (
																			<span>
																				Session:{" "}
																				{order.checkoutSessionId.slice(-12)}
																			</span>
																		)}
																	</p>
																</div>
																<div className="text-right">
																	<p className="font-semibold">
																		${order.totalAmount?.toFixed(2) || "0.00"}
																	</p>
																	<Badge
																		variant={
																			order.status === "paid" ||
																			order.status === "completed"
																				? "default"
																				: "secondary"
																		}
																	>
																		{order.status}
																	</Badge>
																</div>
															</div>
														</div>
													))}
												</div>
											);
										})()}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="remittance">
								<Card>
									<CardHeader>
										<CardTitle>Store Remittance</CardTitle>
										<CardDescription>
											Track revenue by store and manage payouts
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{Array.from(ordersByStore.entries()).map(
												([storeId, data]) => (
													<div
														key={storeId}
														className="p-4 border rounded-lg"
													>
														<div className="flex items-center justify-between">
															<div>
																<p className="font-semibold">
																	Store: {storeId}
																</p>
																<p className="text-sm text-muted-foreground">
																	{data.orders} orders
																</p>
															</div>
															<div className="text-right">
																<p className="font-semibold text-lg">
																	${data.revenue.toFixed(2)}
																</p>
																<p className="text-sm text-muted-foreground">
																	Pending remittance
																</p>
															</div>
														</div>
														<div className="mt-4">
															<Button variant="outline" size="sm">
																Process Remittance
															</Button>
														</div>
													</div>
												)
											)}
											{ordersByStore.size === 0 && (
												<div className="text-center py-12">
													<Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
													<p className="text-lg font-semibold mb-2">
														No store data yet
													</p>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="products">
								<Card>
									<CardHeader>
										<CardTitle>All Products</CardTitle>
										<CardDescription>
											View all products across all stores
										</CardDescription>
									</CardHeader>
									<CardContent>
										{products.length === 0 ? (
											<div className="text-center py-12">
												<Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
												<p className="text-lg font-semibold mb-2">
													No products yet
												</p>
											</div>
										) : (
											<div className="space-y-4">
												{products.map((product) => (
													<div
														key={product._id}
														className="flex items-center gap-4 p-4 border rounded-lg"
													>
														{product.image && (
															<img
																src={product.image}
																alt={product.name}
																className="w-16 h-16 object-cover rounded"
															/>
														)}
														<div className="flex-1">
															<h3 className="font-semibold">
																{product.name}
															</h3>
															<p className="text-sm text-muted-foreground">
																${product.price} • {product.category}
															</p>
														</div>
														<Badge
															variant={
																product.stock > 10
																	? "default"
																	: "destructive"
															}
														>
															{product.stock} in stock
														</Badge>
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>
						</>
					)}
				</Tabs>
			</div>
		</div>
	);
};

export default AdminDashboard;





