import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
	X,
	Plus,
	Package,
	Upload,
	Save,
	Image as ImageIcon,
} from "lucide-react";
import { productAPI, BackendProduct } from "@/lib/api";

interface ProductFormData {
	name: string;
	description: string;
	price: string;
	salePrice: string;
	category: string;
	brand: string;
	sku: string;
	stock: string;
	weight: string;
	length: string;
	width: string;
	height: string;
	image: string;
	tags: string[];
	featured: boolean;
	inStock: boolean;
}

const CATEGORIES = [
	"Electronics",
	"Computers",
	"Audio",
	"Accessories",
	"Gaming",
	"Mobile",
	"Tablets",
	"Wearables",
];

const emptyFormData = (): ProductFormData => ({
	name: "",
	description: "",
	price: "",
	salePrice: "",
	category: "",
	brand: "",
	sku: "",
	stock: "",
	weight: "",
	length: "",
	width: "",
	height: "",
	image: "",
	tags: [],
	featured: false,
	inStock: true,
});

interface ProductFormProps {
	mode?: "create" | "edit";
	productId?: string;
	onSaved?: () => void;
	embedded?: boolean;
}

const AddProductForm = ({
	mode = "create",
	productId,
	onSaved,
	embedded = false,
}: ProductFormProps) => {
	const isEdit = mode === "edit" && !!productId;
	const { toast } = useToast();
	const [isLoadingProduct, setIsLoadingProduct] = useState(isEdit);
	const [newTag, setNewTag] = useState("");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [formData, setFormData] = useState<ProductFormData>(emptyFormData());

	useEffect(() => {
		if (!isEdit || !productId) return;

		const loadProduct = async () => {
			try {
				setIsLoadingProduct(true);
				const product: BackendProduct = await productAPI.getById(productId);
				setFormData({
					name: product.name,
					description: product.description || "",
					price: String(product.price),
					salePrice: "",
					category: product.category,
					brand: product.brand || "",
					sku: product.sku || "",
					stock: String(product.stock ?? 0),
					weight: "",
					length: "",
					width: "",
					height: "",
					image: product.image || "",
					tags: product.tags || [],
					featured: product.featured ?? false,
					inStock: (product.stock ?? 0) > 0,
				});
				if (product.image) {
					setImagePreview(product.image);
				}
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: "Failed to load product";
				toast({
					title: "Error",
					description: message,
					variant: "destructive",
				});
			} finally {
				setIsLoadingProduct(false);
			}
		};

		loadProduct();
	}, [isEdit, productId, toast]);

	const handleInputChange = (
		field: keyof ProductFormData,
		value: string | boolean
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const addTag = () => {
		if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, newTag.trim()],
			}));
			setNewTag("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast({
					title: "Invalid file type",
					description: "Please select an image file",
					variant: "destructive",
				});
				return;
			}

			// Validate file size (5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast({
					title: "File too large",
					description: "Image must be less than 5MB",
					variant: "destructive",
				});
				return;
			}

			setImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.onerror = () => {
				toast({
					title: "Error reading file",
					description: "Failed to load image preview",
					variant: "destructive",
				});
				setImageFile(null);
			};
			reader.readAsDataURL(file);
			// Clear URL input when file is selected
			setFormData((prev) => ({ ...prev, image: "" }));
		}
	};

	const handleRemoveImage = () => {
		setImageFile(null);
		setImagePreview("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (
			!formData.name ||
			!formData.price ||
			!formData.category ||
			!formData.sku
		) {
			toast({
				title: "Validation Error",
				description: "Please fill in all required fields",
				variant: "destructive",
			});
			return;
		}

		if (parseFloat(formData.price) <= 0) {
			toast({
				title: "Validation Error",
				description: "Price must be greater than 0",
				variant: "destructive",
			});
			return;
		}

		if (
			formData.salePrice &&
			parseFloat(formData.salePrice) >= parseFloat(formData.price)
		) {
			toast({
				title: "Validation Error",
				description: "Sale price must be less than regular price",
				variant: "destructive",
			});
			return;
		}

		try {
			// Create FormData if file is uploaded, otherwise use JSON
			let productData: FormData | Record<string, unknown>;

			if (imageFile) {
				// Use FormData for file upload
				const formDataObj = new FormData();
				formDataObj.append("name", formData.name);
				formDataObj.append("description", formData.description);
				formDataObj.append("price", formData.price);
				if (formData.salePrice) {
					formDataObj.append("salePrice", formData.salePrice);
				}
				formDataObj.append("category", formData.category);
				if (formData.brand) {
					formDataObj.append("brand", formData.brand);
				}
				formDataObj.append("sku", formData.sku);
				formDataObj.append("stock", formData.stock || "0");
				if (formData.weight) {
					formDataObj.append("weight", formData.weight);
				}
				if (formData.length) {
					formDataObj.append("length", formData.length);
				}
				if (formData.width) {
					formDataObj.append("width", formData.width);
				}
				if (formData.height) {
					formDataObj.append("height", formData.height);
				}
				formDataObj.append("tags", JSON.stringify(formData.tags));
				formDataObj.append("featured", formData.featured.toString());
				formDataObj.append("inStock", formData.inStock.toString());
				formDataObj.append("image", imageFile);
				productData = formDataObj;
			} else {
				// Use JSON for URL-based image
				productData = {
					name: formData.name,
					description: formData.description,
					price: parseFloat(formData.price),
					salePrice: formData.salePrice
						? parseFloat(formData.salePrice)
						: undefined,
					category: formData.category,
					brand: formData.brand,
					sku: formData.sku,
					stock: parseInt(formData.stock) || 0,
					weight: formData.weight
						? parseFloat(formData.weight)
						: undefined,
					length: formData.length
						? parseFloat(formData.length)
						: undefined,
					width: formData.width
						? parseFloat(formData.width)
						: undefined,
					height: formData.height
						? parseFloat(formData.height)
						: undefined,
					image: formData.image,
					tags: formData.tags,
					featured: formData.featured,
					inStock: formData.inStock,
				};
			}

			if (isEdit && productId) {
				await productAPI.update(productId, productData);
				toast({
					title: "Product Updated",
					description: `${formData.name} has been saved`,
				});
				onSaved?.();
				return;
			}

			await productAPI.create(productData);

			toast({
				title: "Product Created",
				description: `${formData.name} has been successfully added to the catalog`,
			});

			// Reset form
			setFormData(emptyFormData());
			setImageFile(null);
			setImagePreview("");
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to create product";
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		}
	};

	return (
		<div className={embedded ? "" : "max-w-4xl mx-auto p-6"}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Package className="h-6 w-6" />
						{isEdit ? "Edit Product" : "Add New Product"}
					</CardTitle>
					<CardDescription>
						{isEdit
							? "Update catalog details for this product"
							: "Fill in the product details to add it to the shared catalog"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingProduct ? (
						<p className="text-sm text-muted-foreground py-8 text-center">
							Loading product…
						</p>
					) : (
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Basic Information */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">
								Basic Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="name">Product Name *</Label>
									<Input
										id="name"
										placeholder="Enter product name"
										value={formData.name}
										onChange={(e) =>
											handleInputChange(
												"name",
												e.target.value
											)
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="sku">SKU *</Label>
									<Input
										id="sku"
										placeholder="PROD-001"
										value={formData.sku}
										onChange={(e) =>
											handleInputChange(
												"sku",
												e.target.value
											)
										}
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									placeholder="Detailed product description..."
									value={formData.description}
									onChange={(e) =>
										handleInputChange(
											"description",
											e.target.value
										)
									}
									rows={4}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="category">Category *</Label>
									<Select
										value={formData.category}
										onValueChange={(value) =>
											handleInputChange("category", value)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{CATEGORIES.map((category) => (
												<SelectItem
													key={category}
													value={category}
												>
													{category}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="brand">Brand</Label>
									<Input
										id="brand"
										placeholder="Brand name"
										value={formData.brand}
										onChange={(e) =>
											handleInputChange(
												"brand",
												e.target.value
											)
										}
									/>
								</div>
							</div>
						</div>

						{/* Pricing & Inventory */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">
								Pricing & Inventory
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="price">
										Regular Price * ($)
									</Label>
									<Input
										id="price"
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={formData.price}
										onChange={(e) =>
											handleInputChange(
												"price",
												e.target.value
											)
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="salePrice">
										Sale Price ($)
									</Label>
									<Input
										id="salePrice"
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={formData.salePrice}
										onChange={(e) =>
											handleInputChange(
												"salePrice",
												e.target.value
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="stock">
										Stock Quantity
									</Label>
									<Input
										id="stock"
										type="number"
										min="0"
										placeholder="0"
										value={formData.stock}
										onChange={(e) =>
											handleInputChange(
												"stock",
												e.target.value
											)
										}
									/>
								</div>
							</div>
						</div>

						{/* Physical Properties */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">
								Physical Properties
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<div className="space-y-2">
									<Label htmlFor="weight">Weight (lbs)</Label>
									<Input
										id="weight"
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={formData.weight}
										onChange={(e) =>
											handleInputChange(
												"weight",
												e.target.value
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="length">Length (in)</Label>
									<Input
										id="length"
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={formData.length}
										onChange={(e) =>
											handleInputChange(
												"length",
												e.target.value
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="width">Width (in)</Label>
									<Input
										id="width"
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={formData.width}
										onChange={(e) =>
											handleInputChange(
												"width",
												e.target.value
											)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="height">Height (in)</Label>
									<Input
										id="height"
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={formData.height}
										onChange={(e) =>
											handleInputChange(
												"height",
												e.target.value
											)
										}
									/>
								</div>
							</div>
						</div>

						{/* Media & Tags */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">
								Media & Tags
							</h3>
							<div className="space-y-2">
								<Label>Product Image</Label>
								{imagePreview ? (
									<div className="space-y-2">
										<div className="relative w-full h-48 border rounded-lg overflow-hidden">
											<img
												src={imagePreview}
												alt="Preview"
												className="w-full h-full object-cover"
											/>
											<Button
												type="button"
												variant="destructive"
												size="sm"
												className="absolute top-2 right-2"
												onClick={handleRemoveImage}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
										<p className="text-sm text-muted-foreground">
											Image ready to upload
										</p>
									</div>
								) : (
									<div className="space-y-2">
										<div className="flex gap-2">
											<Input
												ref={fileInputRef}
												type="file"
												accept="image/*"
												onChange={handleFileChange}
												className="hidden"
												id="image-file"
											/>
											<Button
												type="button"
												variant="outline"
												onClick={() =>
													fileInputRef.current?.click()
												}
												className="flex items-center gap-2"
											>
												<Upload className="h-4 w-4" />
												Upload Image
											</Button>
											<span className="text-sm text-muted-foreground self-center">
												or
											</span>
											<Input
												id="image-url"
												placeholder="Enter image URL"
												value={formData.image}
												onChange={(e) =>
													handleInputChange(
														"image",
														e.target.value
													)
												}
												className="flex-1"
											/>
										</div>
										<p className="text-xs text-muted-foreground">
											Upload an image file (max 5MB) or
											provide an image URL
										</p>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<Label>Product Tags</Label>
								<div className="flex gap-2">
									<Input
										placeholder="Add tag"
										value={newTag}
										onChange={(e) =>
											setNewTag(e.target.value)
										}
										onKeyPress={(e) =>
											e.key === "Enter" &&
											(e.preventDefault(), addTag())
										}
									/>
									<Button
										type="button"
										onClick={addTag}
										variant="outline"
										size="icon"
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								{formData.tags.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-2">
										{formData.tags.map((tag) => (
											<Badge
												key={tag}
												variant="secondary"
												className="flex items-center gap-1"
											>
												{tag}
												<X
													className="h-3 w-3 cursor-pointer"
													onClick={() =>
														removeTag(tag)
													}
												/>
											</Badge>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Settings */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Settings</h3>
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2">
									<Switch
										id="inStock"
										checked={formData.inStock}
										onCheckedChange={(checked) =>
											handleInputChange(
												"inStock",
												checked
											)
										}
									/>
									<Label htmlFor="inStock">In Stock</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Switch
										id="featured"
										checked={formData.featured}
										onCheckedChange={(checked) =>
											handleInputChange(
												"featured",
												checked
											)
										}
									/>
									<Label htmlFor="featured">
										Featured Product
									</Label>
								</div>
							</div>
						</div>

						{/* Submit Button */}
						<div className="flex justify-end space-x-2 pt-6 border-t">
							<Button type="button" variant="outline">
								Cancel
							</Button>
							<Button
								type="submit"
								className="flex items-center gap-2"
							>
								<Save className="h-4 w-4" />
								{isEdit ? "Save changes" : "Add Product"}
							</Button>
						</div>
					</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default AddProductForm;
