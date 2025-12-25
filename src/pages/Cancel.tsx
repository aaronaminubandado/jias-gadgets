import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/ecommerce/Header";

const Cancel = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen bg-gradient-background">
			<Header />
			<div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
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
							You cancelled the checkout process. Your items are still in your
							cart and you can complete your purchase at any time.
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
							onClick={() => navigate(-1)}
							className="w-full"
							variant="outline"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Go Back
						</Button>
					</div>
				</CardContent>
			</Card>
			</div>
		</div>
	);
};

export default Cancel;

