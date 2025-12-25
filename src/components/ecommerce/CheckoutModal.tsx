import { useState } from "react";
import { CreditCard, Lock, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cart } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { checkoutAPI, CheckoutItem } from "@/lib/api";

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
	const [isProcessing, setIsProcessing] = useState(false);
	const { toast } = useToast();

	const handleCheckout = async () => {
		if (cart.items.length === 0) {
			toast({
				title: "Cart is empty",
				description: "Please add items to your cart before checkout.",
				variant: "destructive",
			});
			return;
		}

		setIsProcessing(true);

		try {
			// Prepare items for checkout API
			const checkoutItems: CheckoutItem[] = cart.items.map((item) => ({
				id: item.product.id,
				quantity: item.quantity,
			}));

			// Create Stripe checkout session
			const response = await checkoutAPI.createSession(checkoutItems);

			// Redirect to Stripe Checkout
			if (response.url) {
                // Validate the URL is from Stripe
				const url = new URL(response.url);
				if (!url.hostname.endsWith('.stripe.com') && url.hostname !== 'checkout.stripe.com') {
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Lock className="w-5 h-5 text-primary" />
						Secure Checkout
					</DialogTitle>
					<DialogDescription>
						You will be redirected to Stripe for secure payment processing.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Order Summary */}
					<Card>
						<CardHeader>
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
											Qty: {item.quantity} × ${item.product.price.toFixed(2)}
										</p>
									</div>
									<p className="font-medium ml-4">
										${(item.product.price * item.quantity).toFixed(2)}
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

					{/* Checkout Button */}
					<Button
						onClick={handleCheckout}
						className="w-full gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
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
