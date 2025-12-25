import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Package,
	Plus,
	Edit,
	Trash2,
	TrendingUp,
	DollarSign,
	ShoppingBag,
	ArrowLeft,
	Loader2,
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { productAPI, orderAPI, BackendProduct, OrdersResponse } from "@/lib/api";
import { Header } from "@/components/ecommerce/Header";

const StoreDashboard = () => {
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [products, setProducts] = useState<BackendProduct[]>([]);
	const [orders, setOrders] = useState<OrdersResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}

		if (user?.role !== "store" && user?.role !== "admin") {
			toast({
				title: "Access Denied",
				description: "This page is for store owners only",
				variant: "destructive",
			});
			navigate("/");
			return;
		}

		loadData();
	}, [isAuthenticated, user, navigate, toast]);

	const loadData = async () => {
		try {
			setIsLoading(true);
			const [productsData, ordersData] = await Promise.all([
				// Use store-specific endpoint for store owners
				user?.role === "store"
					? productAPI.getByStore()
					: productAPI.getAll(),
				orderAPI.getAll(1, 10).catch(() => null), // Orders might fail if no orders
			]);

			setProducts(productsData);
			setOrders(ordersData);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to load dashboard data",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteProduct = async (id: string) => {
		if (!confirm("Are you sure you want to delete this product?")) {
			return;
		}

		try {
			await productAPI.delete(id);
			toast({
				title: "Product Deleted",
				description: "Product has been removed from your store",
			});
			loadData();
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to delete product";
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		}
	};

	if (!isAuthenticated || (user?.role !== "store" && user?.role !== "admin")) {
		return null;
	}

	const totalRevenue = orders?.data.reduce(
		(sum, order) => sum + (order.totalAmount || 0),
		0
	) || 0;
	const totalOrders = orders?.meta.total || 0;
	const totalProducts = products.length;

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
					<h1 className="text-3xl font-bold mb-2">Store Dashboard</h1>
					<p className="text-muted-foreground">
						Manage your products and track your sales
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<DollarSign className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium text-muted-foreground">
									Revenue
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
									Orders
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
									Products
								</span>
							</div>
							<div className="text-2xl font-bold">{totalProducts}</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<ShoppingBag className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium text-muted-foreground">
									In Stock
								</span>
							</div>
							<div className="text-2xl font-bold">
								{products.filter((p) => p.stock > 0).length}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Tabs */}
				<div className="space-y-6">
					<div className="flex gap-2 border-b">
						<Button
							variant={activeTab === "products" ? "default" : "ghost"}
							onClick={() => setActiveTab("products")}
						>
							<Package className="w-4 h-4 mr-2" />
							Products
						</Button>
						<Button
							variant={activeTab === "orders" ? "default" : "ghost"}
							onClick={() => setActiveTab("orders")}
						>
							<ShoppingBag className="w-4 h-4 mr-2" />
							Orders
						</Button>
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
							<span className="ml-2 text-muted-foreground">
								Loading...
							</span>
						</div>
					) : (
						<>
							{activeTab === "products" && (
								<Card>
									<CardHeader>
										<div className="flex items-center justify-between">
											<div>
												<CardTitle>Product Inventory</CardTitle>
												<CardDescription>
													Manage your product catalog
												</CardDescription>
											</div>
											<Link to="/store/add-product">
												<Button>
													<Plus className="w-4 h-4 mr-2" />
													Add Product
												</Button>
											</Link>
										</div>
									</CardHeader>
									<CardContent>
										{products.length === 0 ? (
											<div className="text-center py-12">
												<Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
												<p className="text-lg font-semibold mb-2">
													No products yet
												</p>
												<p className="text-muted-foreground mb-4">
													Get started by adding your first product
												</p>
												<Link to="/store/add-product">
													<Button>
														<Plus className="w-4 h-4 mr-2" />
														Add Your First Product
													</Button>
												</Link>
											</div>
										) : (
											<div className="space-y-4">
												{products.map((product) => (
													<div
														key={product._id}
														className="flex items-center justify-between p-4 border rounded-lg"
													>
														<div className="flex items-center gap-4 flex-1">
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
														<div className="flex items-center gap-2 ml-4">
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	navigate(
																		`/store/edit-product/${product._id}`
																	)
																}
															>
																<Edit className="w-4 h-4" />
															</Button>
															<Button
																variant="destructive"
																size="sm"
																onClick={() =>
																	handleDeleteProduct(product._id)
																}
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														</div>
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							)}

							{activeTab === "orders" && (
								<Card>
									<CardHeader>
										<CardTitle>Recent Orders</CardTitle>
										<CardDescription>
											Orders containing your products
										</CardDescription>
									</CardHeader>
									<CardContent>
										{!orders || orders.data.length === 0 ? (
											<div className="text-center py-12">
												<ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
												<p className="text-lg font-semibold mb-2">
													No orders yet
												</p>
												<p className="text-muted-foreground">
													Orders will appear here once customers purchase your
													products
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
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default StoreDashboard;

