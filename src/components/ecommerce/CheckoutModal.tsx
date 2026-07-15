import { useState } from "react";
import { CreditCard, Lock, Loader2, Truck, Store } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Cart } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { checkoutAPI, FulfillmentMethod } from "@/lib/api";

interface CheckoutModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	cart: Cart;
}

const emptyAddress = {
	line1: "",
	line2: "",
	city: "",
	state: "",
	postalCode: "",
	country: "US",
};

export function CheckoutModal({
	open,
	onOpenChange,
	cart,
}: CheckoutModalProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [fulfillmentMethod, setFulfillmentMethod] =
		useState<FulfillmentMethod>("pickup");
	const [customerName, setCustomerName] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState(emptyAddress);
	const [notes, setNotes] = useState("");
	const { toast } = useToast();

	const resetForm = () => {
		setFulfillmentMethod("pickup");
		setCustomerName("");
		setPhone("");
		setAddress(emptyAddress);
		setNotes("");
	};

	const handleOpenChange = (next: boolean) => {
		if (!next && !isProcessing) {
			resetForm();
		}
		onOpenChange(next);
	};

	const validateForm = (): string | null => {
		if (!customerName.trim()) return "Please enter your name.";
		if (!phone.trim() || phone.trim().length < 7) {
			return "Please enter a valid phone number.";
		}
		if (fulfillmentMethod === "delivery") {
			if (!address.line1.trim()) return "Street address is required for delivery.";
			if (!address.city.trim()) return "City is required for delivery.";
			if (!address.postalCode.trim()) {
				return "Postal code is required for delivery.";
			}
			if (!address.country.trim()) return "Country is required for delivery.";
		}
		return null;
	};

	const handleCheckout = async () => {
		if (cart.items.length === 0) {
			toast({
				title: "Cart is empty",
				description: "Please add items to your cart before checkout.",
				variant: "destructive",
			});
			return;
		}

		const validationError = validateForm();
		if (validationError) {
			toast({
				title: "Missing details",
				description: validationError,
				variant: "destructive",
			});
			return;
		}

		setIsProcessing(true);

		try {
			const checkoutItems = cart.items.map((item) => ({
				id: item.product.id,
				quantity: item.quantity,
			}));

			const response = await checkoutAPI.createSession({
				items: checkoutItems,
				fulfillmentMethod,
				customerName: customerName.trim(),
				phone: phone.trim(),
				...(fulfillmentMethod === "delivery"
					? {
							shippingAddress: {
								line1: address.line1.trim(),
								...(address.line2.trim()
									? { line2: address.line2.trim() }
									: {}),
								city: address.city.trim(),
								...(address.state.trim()
									? { state: address.state.trim() }
									: {}),
								postalCode: address.postalCode.trim(),
								country: address.country.trim(),
							},
						}
					: {}),
				...(notes.trim() ? { notes: notes.trim() } : {}),
			});

			if (response.url) {
				const url = new URL(response.url);
				if (
					!url.hostname.endsWith(".stripe.com") &&
					url.hostname !== "checkout.stripe.com"
				) {
					throw new Error("Invalid checkout URL received");
				}
				window.location.href = response.url;
			} else {
				throw new Error("No checkout URL received");
			}
		} catch (error) {
			setIsProcessing(false);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to create checkout session";

			toast({
				title: "Checkout Error",
				description: errorMessage,
				variant: "destructive",
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Lock className="w-5 h-5 text-primary" />
						Secure Checkout
					</DialogTitle>
					<DialogDescription>
						Choose how you&apos;d like to receive your order, then
						pay securely with Stripe.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Fulfillment</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<RadioGroup
								value={fulfillmentMethod}
								onValueChange={(v) =>
									setFulfillmentMethod(v as FulfillmentMethod)
								}
								className="space-y-2"
							>
								<div className="flex items-center gap-2 rounded-lg border p-3">
									<RadioGroupItem value="pickup" id="pickup" />
									<Label
										htmlFor="pickup"
										className="flex flex-1 cursor-pointer items-center gap-2 font-normal"
									>
										<Store className="h-4 w-4" />
										Store pickup
									</Label>
								</div>
								<div className="flex items-center gap-2 rounded-lg border p-3">
									<RadioGroupItem value="delivery" id="delivery" />
									<Label
										htmlFor="delivery"
										className="flex flex-1 cursor-pointer items-center gap-2 font-normal"
									>
										<Truck className="h-4 w-4" />
										Delivery
									</Label>
								</div>
							</RadioGroup>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-2 sm:col-span-2">
									<Label htmlFor="customerName">Full name</Label>
									<Input
										id="customerName"
										value={customerName}
										onChange={(e) =>
											setCustomerName(e.target.value)
										}
										placeholder="Jane Doe"
										autoComplete="name"
									/>
								</div>
								<div className="space-y-2 sm:col-span-2">
									<Label htmlFor="phone">Phone</Label>
									<Input
										id="phone"
										type="tel"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="+1 (555) 123-4567"
										autoComplete="tel"
									/>
								</div>
							</div>

							{fulfillmentMethod === "delivery" && (
								<div className="space-y-3 rounded-lg border p-3">
									<p className="text-sm font-medium">
										Shipping address
									</p>
									<div className="space-y-2">
										<Label htmlFor="line1">Street address</Label>
										<Input
											id="line1"
											value={address.line1}
											onChange={(e) =>
												setAddress((a) => ({
													...a,
													line1: e.target.value,
												}))
											}
											autoComplete="address-line1"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="line2">
											Apt / suite (optional)
										</Label>
										<Input
											id="line2"
											value={address.line2}
											onChange={(e) =>
												setAddress((a) => ({
													...a,
													line2: e.target.value,
												}))
											}
											autoComplete="address-line2"
										/>
									</div>
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="city">City</Label>
											<Input
												id="city"
												value={address.city}
												onChange={(e) =>
													setAddress((a) => ({
														...a,
														city: e.target.value,
													}))
												}
												autoComplete="address-level2"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="state">State</Label>
											<Input
												id="state"
												value={address.state}
												onChange={(e) =>
													setAddress((a) => ({
														...a,
														state: e.target.value,
													}))
												}
												autoComplete="address-level1"
											/>
										</div>
									</div>
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="space-y-2">
											<Label htmlFor="postalCode">
												Postal code
											</Label>
											<Input
												id="postalCode"
												value={address.postalCode}
												onChange={(e) =>
													setAddress((a) => ({
														...a,
														postalCode: e.target.value,
													}))
												}
												autoComplete="postal-code"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="country">Country</Label>
											<Input
												id="country"
												value={address.country}
												onChange={(e) =>
													setAddress((a) => ({
														...a,
														country: e.target.value,
													}))
												}
												autoComplete="country-name"
											/>
										</div>
									</div>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="notes">Order notes (optional)</Label>
								<Textarea
									id="notes"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Gift message, delivery instructions…"
									rows={2}
								/>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{cart.items.map((item) => (
								<div
									key={item.product.id}
									className="flex justify-between items-center"
								>
									<div className="flex-1">
										<p className="font-medium text-sm">
											{item.product.name}
										</p>
										<p className="text-xs text-muted-foreground">
											Qty: {item.quantity} × $
											{item.product.price.toFixed(2)}
										</p>
									</div>
									<p className="font-medium ml-4">
										$
										{(item.product.price * item.quantity).toFixed(
											2
										)}
									</p>
								</div>
							))}

							<Separator />

							<div className="flex justify-between items-center">
								<p className="font-semibold text-lg">Total:</p>
								<p className="font-bold text-primary text-xl">
									${cart.total.toFixed(2)}
								</p>
							</div>
						</CardContent>
					</Card>

					<Button
						onClick={handleCheckout}
						className="w-full gap-2"
						disabled={isProcessing || cart.items.length === 0}
						size="lg"
					>
						{isProcessing ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Processing...
							</>
						) : (
							<>
								<CreditCard className="w-4 h-4" />
								Proceed to Stripe Checkout
							</>
						)}
					</Button>

					<p className="text-xs text-center text-muted-foreground">
						Your payment information is securely processed by Stripe.
						We never store your card details.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
