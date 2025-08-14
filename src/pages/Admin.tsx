import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
	Plus,
	Package,
	TrendingUp,
	DollarSign,
	Users,
	ExternalLink,
} from "lucide-react";

const Admin = () => {
	const [productName, setProductName] = useState("");
	const [productPrice, setProductPrice] = useState("");
	const [productDescription, setProductDescription] = useState("");
	const [productImage, setProductImage] = useState("");
	const { toast } = useToast();

	// Mock data for demonstration
	const mockSales = [
		{
			id: 1,
			product: "Premium Headphones",
			quantity: 2,
			total: 599.98,
			date: "2024-01-15",
		},
		{
			id: 2,
			product: "Smart Phone",
			quantity: 1,
			total: 999.99,
			date: "2024-01-14",
		},
		{
			id: 3,
			product: "Laptop Pro",
			quantity: 1,
			total: 1299.99,
			date: "2024-01-13",
		},
	];

	const mockProducts = [
		{ id: 1, name: "Premium Headphones", price: 299.99, stock: 15 },
		{ id: 2, name: "Smart Phone", price: 999.99, stock: 8 },
		{ id: 3, name: "Laptop Pro", price: 1299.99, stock: 5 },
		{ id: 4, name: "Smart Watch", price: 249.99, stock: 12 },
	];

	const handleAddProduct = (e: React.FormEvent) => {
		e.preventDefault();

		if (!productName || !productPrice) {
			toast({
				title: "Error",
				description: "Please fill in all required fields",
				variant: "destructive",
			});
			return;
		}

		toast({
			title: "Product added",
			description: `${productName} has been added to your store`,
		});

		// Reset form
		setProductName("");
		setProductPrice("");
		setProductDescription("");
		setProductImage("");
	};

	const totalRevenue = mockSales.reduce((sum, sale) => sum + sale.total, 0);
	const totalOrders = mockSales.length;
	const totalProducts = mockProducts.length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
					<p className="text-muted-foreground">
						Manage your store products and track sales
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
							<div className="text-2xl font-bold">
								{totalOrders}
							</div>
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
							<div className="text-2xl font-bold">
								{totalProducts}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center space-x-2">
								<Users className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium text-muted-foreground">
									Customers
								</span>
							</div>
							<div className="text-2xl font-bold">127</div>
						</CardContent>
					</Card>
				</div>

				<Tabs defaultValue="products" className="space-y-6">
					<TabsList>
						<TabsTrigger value="products">
							Manage Products
						</TabsTrigger>
						<TabsTrigger value="sales">Sales Tracking</TabsTrigger>
						<TabsTrigger value="add-product">Quick Add</TabsTrigger>
					</TabsList>

					<TabsContent value="products">
						<Card>
							<CardHeader>
								<CardTitle>Product Inventory</CardTitle>
								<CardDescription>
									Manage your product catalog and stock levels
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{mockProducts.map((product) => (
										<div
											key={product.id}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div>
												<h3 className="font-semibold">
													{product.name}
												</h3>
												<p className="text-sm text-muted-foreground">
													${product.price}
												</p>
											</div>
											<div className="flex items-center space-x-2">
												<Badge
													variant={
														product.stock > 10
															? "default"
															: "destructive"
													}
												>
													{product.stock} in stock
												</Badge>
												<Button
													variant="outline"
													size="sm"
												>
													Edit
												</Button>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="sales">
						<Card>
							<CardHeader>
								<CardTitle>Sales Overview</CardTitle>
								<CardDescription>
									Track your recent sales and revenue
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{mockSales.map((sale) => (
										<div
											key={sale.id}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div>
												<h3 className="font-semibold">
													{sale.product}
												</h3>
												<p className="text-sm text-muted-foreground">
													Quantity: {sale.quantity}
												</p>
											</div>
											<div className="text-right">
												<p className="font-semibold">
													${sale.total}
												</p>
												<p className="text-sm text-muted-foreground">
													{sale.date}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="add-product">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Plus className="h-5 w-5" />
										<span>Quick Add Product</span>
									</div>
									<Link to="/admin/add-product">
										<Button
											variant="outline"
											size="sm"
											className="flex items-center gap-2"
										>
											<ExternalLink className="h-4 w-4" />
											Full Form
										</Button>
									</Link>
								</CardTitle>
								<CardDescription>
									Quick add for simple products. Use the full
									form for complete product details.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form
									onSubmit={handleAddProduct}
									className="space-y-4"
								>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="name">
												Product Name *
											</Label>
											<Input
												id="name"
												placeholder="Enter product name"
												value={productName}
												onChange={(e) =>
													setProductName(
														e.target.value
													)
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="price">
												Price *
											</Label>
											<Input
												id="price"
												type="number"
												step="0.01"
												placeholder="0.00"
												value={productPrice}
												onChange={(e) =>
													setProductPrice(
														e.target.value
													)
												}
												required
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="description">
											Description
										</Label>
										<Textarea
											id="description"
											placeholder="Enter product description"
											value={productDescription}
											onChange={(e) =>
												setProductDescription(
													e.target.value
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="image">Image URL</Label>
										<Input
											id="image"
											placeholder="https://example.com/image.jpg"
											value={productImage}
											onChange={(e) =>
												setProductImage(e.target.value)
											}
										/>
									</div>
									<Button type="submit" className="w-full">
										Add Product
									</Button>
								</form>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default Admin;
