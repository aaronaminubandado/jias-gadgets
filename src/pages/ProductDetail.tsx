import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreLayout } from "@/components/ecommerce/StoreLayout";
import { productAPI } from "@/lib/api";
import { convertProduct } from "@/lib/convertProduct";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/hooks/use-toast";

const ProductDetail = () => {
	const { id } = useParams<{ id: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);
	const { addToCart } = useCart();

	useEffect(() => {
		if (!id) {
			setNotFound(true);
			setIsLoading(false);
			return;
		}

		const fetchProduct = async () => {
			try {
				setIsLoading(true);
				setNotFound(false);
				const backendProduct = await productAPI.getById(id);
				setProduct(convertProduct(backendProduct));
			} catch {
				setNotFound(true);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProduct();
	}, [id]);

	const handleAddToCart = () => {
		if (!product) return;
		if (!product.inStock) {
			toast({
				title: "Out of Stock",
				description: "This item is currently unavailable.",
				variant: "destructive",
			});
			return;
		}

		addToCart(product);
		toast({
			title: "Added to Cart",
			description: `${product.name} has been added to your cart.`,
		});
	};

	const hasImage = product?.image && product.image !== "/placeholder.svg";

	return (
		<StoreLayout mainClassName="container mx-auto px-4 py-8">
				{isLoading ? (
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						<Skeleton className="aspect-square w-full rounded-lg" />
						<div className="space-y-4">
							<Skeleton className="h-6 w-24" />
							<Skeleton className="h-10 w-3/4" />
							<Skeleton className="h-8 w-32" />
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-11 w-40" />
						</div>
					</div>
				) : notFound || !product ? (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<h1 className="font-display text-2xl font-bold text-foreground">
							Product not found
						</h1>
						<p className="mt-2 text-muted-foreground">
							This product may have been removed from the catalog.
						</p>
						<Button asChild className="mt-6">
							<Link to="/">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to shop
							</Link>
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						<div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
							{hasImage ? (
								<img
									src={product.image}
									alt={product.name}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center">
									<ImageIcon className="w-16 h-16 text-muted-foreground" />
								</div>
							)}
						</div>

						<div>
							<div className="flex items-center gap-3">
								<Badge variant="secondary">
									{product.category}
								</Badge>
								{product.brand && (
									<span className="text-sm text-muted-foreground">
										{product.brand}
									</span>
								)}
							</div>

							<h1 className="mt-4 font-display text-3xl font-bold text-foreground md:text-4xl">
								{product.name}
							</h1>

							<p className="mt-4 font-mono text-3xl font-bold text-primary">
								${product.price.toFixed(2)}
							</p>

							<p className="mt-2 text-sm">
								{!product.inStock ? (
									<span className="text-destructive">
										Out of stock
									</span>
								) : product.stock <= 5 ? (
									<span className="font-medium text-accent">
										Only {product.stock} left
									</span>
								) : (
									<span className="text-success">
										In stock
									</span>
								)}
							</p>

							{product.description && (
								<p className="mt-6 text-muted-foreground">
									{product.description}
								</p>
							)}

							<Button
								onClick={handleAddToCart}
								disabled={!product.inStock}
								size="lg"
								className="mt-8 gap-2"
							>
								<ShoppingCart className="w-5 h-5" />
								Add to Cart
							</Button>

							{product.sku && (
								<p className="mt-6 font-mono text-xs text-muted-foreground">
									SKU: {product.sku}
								</p>
							)}
						</div>
					</div>
				)}
		</StoreLayout>
	);
};

export default ProductDetail;
