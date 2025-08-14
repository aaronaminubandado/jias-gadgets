import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();
	const { toast } = useToast();

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();

		// Mock login - in real app this would authenticate with backend
		if (email === "admin@store.com" && password === "admin123") {
			toast({
				title: "Login successful",
				description: "Welcome to the admin dashboard",
			});
			navigate("/admin");
		} else {
			toast({
				title: "Login failed",
				description: "Invalid email or password",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">
						Admin Login
					</CardTitle>
					<CardDescription>
						Sign in to manage your store
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="admin@store.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<Button type="submit" className="w-full">
							Sign In
						</Button>
					</form>
					<div className="mt-4 text-center text-sm text-muted-foreground">
						Demo credentials: admin@store.com / admin123
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default Login;
