import { useState, useEffect } from "react";
import { Filter, Grid, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "./ProductCard";
import { productAPI, BackendProduct } from "@/lib/api";
import { Product } from "@/types/product";
import { useToast } from "@/hooks/use-toast";

// Convert backend product to frontend product format
const convertProduct = (backendProduct: BackendProduct): Product => {
	return {
		id: backendProduct._id,
		name: backendProduct.name,
		price: backendProduct.price,
		image: backendProduct.image || "/placeholder.svg",
		description: backendProduct.description || "",
		category: backendProduct.category,
		rating: 0, // Backend doesn't have rating, default to 0
inStock: (backendProduct.stock - (backendProduct.reserved || 0)) > 0,
stock: backendProduct.stock - (backendProduct.reserved || 0),
		sku: backendProduct.sku || "",
		brand: backendProduct.brand || "",
		tags: backendProduct.tags || [],
		featured: backendProduct.featured || false,
	};
};

export function ProductGrid() {
	const [sortBy, setSortBy] = useState("name");
	const [filterCategory, setFilterCategory] = useState("all");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const backendProducts = await productAPI.getAll();
				const convertedProducts = backendProducts.map(convertProduct);
				setProducts(convertedProducts);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to load products";
				setError(errorMessage);
				toast({
					title: "Error",
					description: errorMessage,
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchProducts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const categories = [
		"all",
		...Array.from(new Set(products.map((p) => p.category))),
	];

	const filteredAndSortedProducts = products
		.filter(
			(product) =>
				filterCategory === "all" || product.category === filterCategory
		)
		.sort((a, b) => {
			switch (sortBy) {
				case "price-low":
					return a.price - b.price;
				case "price-high":
					return b.price - a.price;
				case "rating":
					return b.rating - a.rating;
				default:
					return a.name.localeCompare(b.name);
			}
		});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground">
						Our Products
					</h2>
					<p className="text-muted-foreground">
						Discover our latest collection of premium tech products
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant={viewMode === "grid" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("grid")}
					>
						<Grid className="w-4 h-4" />
					</Button>
					<Button
						variant={viewMode === "list" ? "default" : "outline"}
						size="sm"
						onClick={() => setViewMode("list")}
					>
						<List className="w-4 h-4" />
					</Button>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
				<div className="flex items-center gap-2">
					<Filter className="w-4 h-4 text-muted-foreground" />
					<span className="text-sm font-medium">Filters:</span>
				</div>

				<Select
					value={filterCategory}
					onValueChange={setFilterCategory}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Category" />
					</SelectTrigger>
					<SelectContent>
						{categories.map((category) => (
							<SelectItem key={category} value={category}>
								{category === "all"
									? "All Categories"
									: category}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={sortBy} onValueChange={setSortBy}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="name">Name A-Z</SelectItem>
						<SelectItem value="price-low">
							Price: Low to High
						</SelectItem>
						<SelectItem value="price-high">
							Price: High to Low
						</SelectItem>
						<SelectItem value="rating">Highest Rated</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Products Grid */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="w-8 h-8 animate-spin text-primary" />
					<span className="ml-2 text-muted-foreground">Loading products...</span>
				</div>
			) : error ? (
				<div className="text-center py-12">
					<p className="text-lg text-destructive">{error}</p>
					<Button
						variant="outline"
						onClick={() => window.location.reload()}
						className="mt-4"
					>
						Retry
					</Button>
				</div>
			) : (
				<>
					<div
						className={`grid gap-6 ${
							viewMode === "grid"
								? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
								: "grid-cols-1"
						}`}
					>
						{filteredAndSortedProducts.map((product) => (
							<div key={product.id} className="fade-in">
								<ProductCard product={product} />
							</div>
						))}
					</div>

					{filteredAndSortedProducts.length === 0 && (
						<div className="text-center py-12">
							<p className="text-lg text-muted-foreground">
								No products found matching your criteria.
							</p>
						</div>
					)}
				</>
			)}
		</div>
	);
}
