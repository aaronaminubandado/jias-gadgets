import { useState, useEffect } from "react";
import { Package, DollarSign, ShoppingBag, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreLayout } from "@/components/ecommerce/StoreLayout";
import { staffAPI, StaffMetrics } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AddProductForm from "@/pages/AddProduct";

const ManageDashboard = () => {
	const [metrics, setMetrics] = useState<StaffMetrics | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		const load = async () => {
			try {
				setIsLoading(true);
				const data = await staffAPI.getMetrics();
				setMetrics(data);
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: "Failed to load metrics";
				toast({
					title: "Error",
					description: message,
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		load();
	}, [toast]);

	return (
		<StoreLayout mainClassName="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Store management</h1>
				<p className="text-muted-foreground mt-1">
					Overview and catalog tools for staff
				</p>
			</div>

			<Tabs defaultValue="dashboard" className="space-y-6">
				<TabsList>
					<TabsTrigger value="dashboard">Dashboard</TabsTrigger>
					<TabsTrigger value="add-product">Add product</TabsTrigger>
				</TabsList>

				<TabsContent value="dashboard" className="space-y-6">
					{isLoading ? (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<Skeleton key={i} className="h-28 rounded-lg" />
							))}
						</div>
					) : metrics ? (
						<>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardHeader className="pb-2">
										<CardDescription>Products</CardDescription>
										<CardTitle className="text-3xl">
											{metrics.productCount}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-xs text-muted-foreground flex items-center gap-1">
											<Package className="h-3.5 w-3.5" />
											In catalog
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardDescription>Paid orders</CardDescription>
										<CardTitle className="text-3xl">
											{metrics.paidOrders}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-xs text-muted-foreground flex items-center gap-1">
											<ShoppingBag className="h-3.5 w-3.5" />
											{metrics.totalOrders} total orders
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardDescription>Revenue</CardDescription>
										<CardTitle className="text-3xl">
											${metrics.revenueTotal.toFixed(2)}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-xs text-muted-foreground flex items-center gap-1">
											<DollarSign className="h-3.5 w-3.5" />
											From paid orders
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-2">
										<CardDescription>Last 7 days</CardDescription>
										<CardTitle className="text-3xl">
											{metrics.ordersLast7Days}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-xs text-muted-foreground">
											Paid orders this week
										</p>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-lg">
										<AlertTriangle className="h-5 w-5 text-accent" />
										Low stock
									</CardTitle>
									<CardDescription>
										Products with {5} or fewer units available
									</CardDescription>
								</CardHeader>
								<CardContent>
									{metrics.lowStockProducts.length === 0 ? (
										<p className="text-sm text-muted-foreground">
											All products are well stocked.
										</p>
									) : (
										<ul className="space-y-2">
											{metrics.lowStockProducts.map((p) => (
												<li
													key={p.id}
													className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
												>
													<span>{p.name}</span>
													<span className="font-mono text-accent">
														{p.stock} left
													</span>
												</li>
											))}
										</ul>
									)}
								</CardContent>
							</Card>
						</>
					) : null}
				</TabsContent>

				<TabsContent value="add-product">
					<AddProductForm />
				</TabsContent>
			</Tabs>
		</StoreLayout>
	);
};

export default ManageDashboard;
