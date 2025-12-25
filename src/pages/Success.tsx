import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/ecommerce/Header";
import { useCart } from "@/hooks/useCart";

const Success = () => {
	const navigate = useNavigate();
	const { clearCart } = useCart();
	const [searchParams] = useSearchParams();
	const [isVerifying, setIsVerifying] = useState(true);

	useEffect(() => {
		const verifyPayment = async () => {
			const sessionId = searchParams.get("session_id");
			if (!sessionId) {
				navigate("/cart");
				return;
			}

			try {
				// Verify payment with your backend
				const response = await fetch(
					`/api/verify-payment?session_id=${sessionId}`
				);
				if (response.ok) {
					clearCart();
				} else {
					navigate("/cart");
				}
			} catch (error) {
				console.error("Payment verification failed:", error);
				navigate("/cart");
			} finally {
				setIsVerifying(false);
			}
		};

		verifyPayment();
	}, [searchParams, navigate, clearCart]);

	if (isVerifying) {
		return <div>Verifying payment...</div>;
	}

	return (
		<div className="min-h-screen bg-gradient-background">
			<Header />
			<div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="flex justify-center mb-4">
							<CheckCircle className="w-16 h-16 text-green-500" />
						</div>
						<CardTitle className="text-2xl font-bold">
							Payment Successful!
						</CardTitle>
						<CardDescription>
							Thank you for your purchase. Your order has been
							confirmed.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-muted/50 rounded-lg p-4 space-y-2">
							<p className="text-sm text-muted-foreground">
								Your payment has been processed successfully.
								You will receive an email confirmation shortly
								with your order details.
							</p>
							<p className="text-sm text-muted-foreground">
								If you have any questions about your order,
								please contact our support team.
							</p>
						</div>

						<div className="flex flex-col gap-2">
							<Button
								onClick={() => navigate("/")}
								className="w-full"
								variant="default"
							>
								<ShoppingBag className="w-4 h-4 mr-2" />
								Continue Shopping
							</Button>
							<Button
								onClick={() => navigate("/orders")}
								className="w-full"
								variant="outline"
							>
								View Orders
								<ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default Success;
