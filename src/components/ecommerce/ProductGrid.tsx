import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "./ProductCard";
import { productAPI } from "@/lib/api";
import { Product } from "@/types/product";
import { convertProduct } from "@/lib/convertProduct";
import { useToast } from "@/hooks/use-toast";

export function ProductGrid() {
	const [sortBy, setSortBy] = useState("name");
	const [filterCategory, setFilterCategory] = useState("all");
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchParams] = useSearchParams();
	const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();
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

	const featured = products.filter((p) => p.featured);

	const filteredAndSortedProducts = products
		.filter(
			(product) =>
				filterCategory === "all" || product.category === filterCategory
		)
		.filter((product) => {
			if (!searchQuery) return true;
			const haystack = [
				product.name,
				product.brand,
				product.category,
				product.tags.join(" "),
			]
				.join(" ")
				.toLowerCase();
			return haystack.includes(searchQuery);
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "price-low":
					return a.price - b.price;
				case "price-high":
					return b.price - a.price;
				default:
					return a.name.localeCompare(b.name);
			}
		});

	return (
		<div className="space-y-6">
			{/* Featured strip */}
			{!isLoading && !error && featured.length > 0 && (
				<section>
					<p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
						Staff picks
					</p>
					<h2 className="mt-1 font-display text-2xl font-bold text-foreground">
						Featured
					</h2>
					<div className="mt-4 flex gap-6 overflow-x-auto pb-4">
						{featured.map((product) => (
							<div key={product.id} className="w-[280px] shrink-0">
								<ProductCard product={product} />
							</div>
						))}
					</div>
				</section>
			)}

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
					</SelectContent>
				</Select>
			</div>

			{/* Products Grid */}
			{isLoading ? (
				<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Card key={i} className="border-card-border bg-card">
							<CardContent className="p-0">
								<Skeleton className="aspect-[4/3] w-full rounded-b-none" />
								<div className="space-y-3 p-6">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-8 w-1/3" />
								</div>
							</CardContent>
						</Card>
					))}
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
					<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
