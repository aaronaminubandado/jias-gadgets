import { useState } from "react";
import { CreditCard, Lock, CheckCircle } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cart } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/hooks/use-toast";

interface CheckoutModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	cart: Cart;
}

export function CheckoutModal({
	open,
	onOpenChange,
	cart,
}: CheckoutModalProps) {
	const { clearCart } = useCart();
	const [isProcessing, setIsProcessing] = useState(false);
	const [isComplete, setIsComplete] = useState(false);

	const [formData, setFormData] = useState({
		email: "",
		firstName: "",
		lastName: "",
		address: "",
		city: "",
		zipCode: "",
		cardNumber: "",
		expiryDate: "",
		cvv: "",
	});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsProcessing(true);

		// Simulate payment processing
		await new Promise((resolve) => setTimeout(resolve, 2000));

		setIsProcessing(false);
		setIsComplete(true);
		clearCart();

		toast({
			title: "Payment Successful!",
			description:
				"Your order has been confirmed. You'll receive an email confirmation shortly.",
		});

		// Close modal after showing success
		setTimeout(() => {
			setIsComplete(false);
			onOpenChange(false);
		}, 3000);
	};

	if (isComplete) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-md">
					<div className="text-center py-8">
						<CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
						<h3 className="text-xl font-semibold mb-2">
							Payment Successful!
						</h3>
						<p className="text-muted-foreground">
							Thank you for your purchase. Your order is being
							processed.
						</p>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Lock className="w-5 h-5 text-primary" />
						Secure Checkout
					</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Order Summary */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">
								Order Summary
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{cart.items.map((item) => (
								<div
									key={item.product.id}
									className="flex justify-between items-center"
								>
									<div>
										<p className="font-medium text-sm">
											{item.product.name}
										</p>
										<p className="text-xs text-muted-foreground">
											Qty: {item.quantity}
										</p>
									</div>
									<p className="font-medium">
										$
										{(
											item.product.price * item.quantity
										).toFixed(2)}
									</p>
								</div>
							))}

							<Separator />

							<div className="flex justify-between items-center">
								<p className="font-semibold">Total:</p>
								<p className="font-bold text-primary text-lg">
									${cart.total.toFixed(2)}
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Checkout Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-4">
							<h3 className="font-semibold">
								Contact Information
							</h3>
							<div>
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) =>
										handleInputChange(
											"email",
											e.target.value
										)
									}
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="firstName">
										First Name
									</Label>
									<Input
										id="firstName"
										value={formData.firstName}
										onChange={(e) =>
											handleInputChange(
												"firstName",
												e.target.value
											)
										}
										required
									/>
								</div>
								<div>
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										value={formData.lastName}
										onChange={(e) =>
											handleInputChange(
												"lastName",
												e.target.value
											)
										}
										required
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="font-semibold">Shipping Address</h3>
							<div>
								<Label htmlFor="address">Address</Label>
								<Input
									id="address"
									value={formData.address}
									onChange={(e) =>
										handleInputChange(
											"address",
											e.target.value
										)
									}
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="city">City</Label>
									<Input
										id="city"
										value={formData.city}
										onChange={(e) =>
											handleInputChange(
												"city",
												e.target.value
											)
										}
										required
									/>
								</div>
								<div>
									<Label htmlFor="zipCode">ZIP Code</Label>
									<Input
										id="zipCode"
										value={formData.zipCode}
										onChange={(e) =>
											handleInputChange(
												"zipCode",
												e.target.value
											)
										}
										required
									/>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h3 className="font-semibold flex items-center gap-2">
								<CreditCard className="w-4 h-4" />
								Payment Information
							</h3>
							<div>
								<Label htmlFor="cardNumber">Card Number</Label>
								<Input
									id="cardNumber"
									placeholder="1234 5678 9012 3456"
									value={formData.cardNumber}
									onChange={(e) =>
										handleInputChange(
											"cardNumber",
											e.target.value
										)
									}
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="expiryDate">
										Expiry Date
									</Label>
									<Input
										id="expiryDate"
										placeholder="MM/YY"
										value={formData.expiryDate}
										onChange={(e) =>
											handleInputChange(
												"expiryDate",
												e.target.value
											)
										}
										required
									/>
								</div>
								<div>
									<Label htmlFor="cvv">CVV</Label>
									<Input
										id="cvv"
										placeholder="123"
										value={formData.cvv}
										onChange={(e) =>
											handleInputChange(
												"cvv",
												e.target.value
											)
										}
										required
									/>
								</div>
							</div>
						</div>

						<Button
							type="submit"
							className="w-full gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
							disabled={isProcessing}
						>
							{isProcessing ? (
								<>Processing...</>
							) : (
								<>
									<Lock className="w-4 h-4" />
									Complete Order - ${cart.total.toFixed(2)}
								</>
							)}
						</Button>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
