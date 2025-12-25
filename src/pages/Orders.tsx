import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Package,
	Loader2,
	ArrowLeft,
	Calendar,
	DollarSign,
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
import { orderAPI, Order } from "@/lib/api";
import { format } from "date-fns";

const Orders = () => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const navigate = useNavigate();
	const { toast } = useToast();
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}

		const fetchOrders = async () => {
			try {
				setIsLoading(true);
				const response = await orderAPI.getAll(page, 10);
				setOrders(response.data);
				if (response.meta?.limit && response.meta.limit > 0) {
                    					setTotalPages(Math.ceil(response.meta.total / response.meta.limit));
                    				} else {
                    					setTotalPages(1);
                    				}
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to load orders";
				toast({
					title: "Error",
					description: errorMessage,
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrders();
	}, [isAuthenticated, navigate, page]);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "completed":
			case "paid":
				return "default";
			case "pending":
				return "secondary";
			case "cancelled":
			case "failed":
				return "destructive";
			default:
				return "outline";
		}
	};

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
			<div className="max-w-4xl mx-auto">
				<div className="mb-6">
					<Button
						variant="ghost"
						onClick={() => navigate("/")}
						className="mb-4"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Home
					</Button>
					<h1 className="text-3xl font-bold mb-2">My Orders</h1>
					<p className="text-muted-foreground">
						View your order history and track your purchases
					</p>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="w-8 h-8 animate-spin text-primary" />
						<span className="ml-2 text-muted-foreground">
							Loading orders...
						</span>
					</div>
				) : orders.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12">
							<Package className="w-16 h-16 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">
								No orders yet
							</h3>
							<p className="text-muted-foreground mb-4">
								You haven't placed any orders yet.
							</p>
							<Button onClick={() => navigate("/")}>
								Start Shopping
							</Button>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{orders.map((order) => (
							<Card key={order.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="flex items-center gap-2">
												<Package className="w-5 h-5" />
												Order #
												{order.id
													.slice(-8)
													.padStart(8, "0")
													.toUpperCase()}
											</CardTitle>
											<CardDescription className="flex items-center gap-4 mt-2">
												<span className="flex items-center gap-1">
													<Calendar className="w-4 h-4" />
													{order.createdAt
														? format(
																new Date(
																	order.createdAt
																),
																"MMM dd, yyyy 'at' h:mm a"
														  )
														: "Date not available"}
												</span>
											</CardDescription>
										</div>
										<Badge
											variant={getStatusColor(
												order.status
											)}
										>
											{order.status.toUpperCase()}
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="space-y-2">
											{order.products.map(
												(product) => (
													<div
														key={product.productId}
														className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
													>
														<div className="flex items-center gap-3">
															{product.image && (
																<img
																	src={
																		product.image
																	}
																	alt={
																		product.name ||
																		"Product"
																	}
																	className="w-12 h-12 object-cover rounded"
																/>
															)}
															<div>
																<p className="font-medium">
																	{product.name ||
																		"Product"}
																</p>
																<p className="text-sm text-muted-foreground">
																	Quantity:{" "}
																	{
																		product.quantity
																	}
																</p>
															</div>
														</div>
														<p className="font-medium">
															$
															{typeof product.price ===
															"number"
																? product.price.toFixed(
																		2
																  )
																: "0.00"}
														</p>
													</div>
												)
											)}
										</div>

										<div className="flex items-center justify-between pt-4 border-t">
											<span className="text-lg font-semibold flex items-center gap-2">
												<DollarSign className="w-5 h-5" />
												Total:
											</span>
											<span className="text-xl font-bold text-primary">
												$
												{order.totalAmount?.toFixed(
													2
												) || "0.00"}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						))}

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex items-center justify-center gap-2 pt-4">
								<Button
									variant="outline"
									onClick={() =>
										setPage((p) => Math.max(1, p - 1))
									}
									disabled={page === 1}
								>
									Previous
								</Button>
								<span className="text-sm text-muted-foreground">
									Page {page} of {totalPages}
								</span>
								<Button
									variant="outline"
									onClick={() =>
										setPage((p) =>
											Math.min(totalPages, p + 1)
										)
									}
									disabled={page === totalPages}
								>
									Next
								</Button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Orders;
