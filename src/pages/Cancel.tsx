import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/ecommerce/Header";
import { Footer } from "@/components/ecommerce/Footer";
import { useCart } from "@/hooks/useCart";
import { checkoutAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Cancel = () => {
	const navigate = useNavigate();
	const { cart } = useCart();
	const [searchParams] = useSearchParams();
	const { toast } = useToast();
	const hasCancelled = useRef(false);
	const hasItems = cart.itemCount > 0;

	useEffect(() => {
		const sessionId = searchParams.get("session_id");
		if (!sessionId || hasCancelled.current) return;

		hasCancelled.current = true;
		checkoutAPI.cancelSession(sessionId).catch((error) => {
			const message =
				error instanceof Error
					? error.message
					: "Could not cancel the pending order";
			toast({
				title: "Order cancellation",
				description: message,
				variant: "destructive",
			});
		});
	}, [searchParams, toast]);

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Header />
			<div className="flex flex-1 items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<XCircle className="w-16 h-16 text-destructive" />
						</div>
						<CardTitle className="text-2xl font-bold">
							Payment Cancelled
						</CardTitle>
						<CardDescription>
							Your payment was cancelled. No charges were made.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-muted/50 rounded-lg p-4">
							<p className="text-sm text-muted-foreground">
								{hasItems
									? `You cancelled checkout. Your ${cart.itemCount} item${cart.itemCount === 1 ? "" : "s"} ${cart.itemCount === 1 ? "is" : "are"} still in your cart — open the cart from the header to try again.`
									: "Your cart is empty. Browse products and add items before checking out again."}
							</p>
						</div>

						<div className="flex flex-col gap-2">
							<Button
								onClick={() => navigate("/")}
								className="w-full"
								variant="default"
							>
								<ShoppingBag className="w-4 h-4 mr-2" />
								{hasItems ? "Return to store" : "Continue shopping"}
							</Button>
							{hasItems && (
								<p className="text-center text-xs text-muted-foreground">
									Use the cart icon in the header to complete your purchase.
								</p>
							)}
							<Button
								onClick={() => navigate("/")}
								className="w-full"
								variant="outline"
							>
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to home
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
			<Footer />
		</div>
	);
};

export default Cancel;
