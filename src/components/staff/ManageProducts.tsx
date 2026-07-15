import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { productAPI, BackendProduct } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import AddProductForm from "@/pages/AddProduct";

export function ManageProducts() {
	const [products, setProducts] = useState<BackendProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editingId, setEditingId] = useState<string | null>(null);
	const { toast } = useToast();

	const loadProducts = async () => {
		try {
			setIsLoading(true);
			const data = await productAPI.getAll();
			setProducts(data);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to load products";
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadProducts();
	}, []);

	const handleDelete = async (id: string, name: string) => {
		if (!window.confirm(`Delete "${name}" from the catalog?`)) return;

		try {
			await productAPI.delete(id);
			setProducts((prev) => prev.filter((product) => product._id !== id));
			toast({
				title: "Product deleted",
				description: `${name} was removed from the catalog`,
			});
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

	if (isLoading) {
		return <Skeleton className="h-64 w-full" />;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{products.length} product{products.length === 1 ? "" : "s"}{" "}
					in catalog
				</p>
				<Button variant="outline" onClick={loadProducts}>
					Refresh
				</Button>
			</div>

			{products.length === 0 ? (
				<p className="text-sm text-muted-foreground py-8 text-center">
					No products yet. Use the Add product tab to create one.
				</p>
			) : (
				<div className="rounded-md border overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>SKU</TableHead>
								<TableHead>Category</TableHead>
								<TableHead className="text-right">Price</TableHead>
								<TableHead className="text-right">Stock</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{products.map((product) => (
								<TableRow key={product._id}>
									<TableCell className="font-medium">
										{product.name}
									</TableCell>
									<TableCell className="font-mono text-xs">
										{product.sku || "—"}
									</TableCell>
									<TableCell>{product.category}</TableCell>
									<TableCell className="text-right">
										${Number(product.price).toFixed(2)}
									</TableCell>
									<TableCell className="text-right">
										{product.stock}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													setEditingId(product._id)
												}
												aria-label={`Edit ${product.name}`}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													handleDelete(
														product._id,
														product.name
													)
												}
												aria-label={`Delete ${product.name}`}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<Dialog
				open={editingId !== null}
				onOpenChange={(open) => {
					if (!open) setEditingId(null);
				}}
			>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit product</DialogTitle>
					</DialogHeader>
					{editingId && (
						<AddProductForm
							mode="edit"
							productId={editingId}
							embedded
							onSaved={() => {
								setEditingId(null);
								loadProducts();
							}}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
