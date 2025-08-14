import { useState } from "react";
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
import { X, Plus, Package, Upload, Save } from "lucide-react";

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

const AddProductForm = () => {
	const { toast } = useToast();
	const [newTag, setNewTag] = useState("");
	const [formData, setFormData] = useState<ProductFormData>({
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

	const handleSubmit = (e: React.FormEvent) => {
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

		// Mock product creation
		const productId = `prod_${Date.now()}`;

		toast({
			title: "Product Created",
			description: `${formData.name} has been successfully added to your store`,
		});

		console.log("New Product:", {
			id: productId,
			...formData,
			price: parseFloat(formData.price),
			salePrice: formData.salePrice
				? parseFloat(formData.salePrice)
				: undefined,
			stock: parseInt(formData.stock) || 0,
			weight: formData.weight ? parseFloat(formData.weight) : undefined,
			dimensions:
				formData.length && formData.width && formData.height
					? {
							length: parseFloat(formData.length),
							width: parseFloat(formData.width),
							height: parseFloat(formData.height),
					  }
					: undefined,
		});

		// Reset form
		setFormData({
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
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Package className="h-6 w-6" />
						Add New Product
					</CardTitle>
					<CardDescription>
						Fill in all the product details to add it to your store
						catalog
					</CardDescription>
				</CardHeader>
				<CardContent>
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
								<Label htmlFor="image">Product Image URL</Label>
								<div className="flex gap-2">
									<Input
										id="image"
										placeholder="https://example.com/image.jpg"
										value={formData.image}
										onChange={(e) =>
											handleInputChange(
												"image",
												e.target.value
											)
										}
										className="flex-1"
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
									>
										<Upload className="h-4 w-4" />
									</Button>
								</div>
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
										{formData.tags.map((tag, index) => (
											<Badge
												key={index}
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
								Add Product
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default AddProductForm;
