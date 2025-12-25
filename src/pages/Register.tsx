import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Register = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [role, setRole] = useState<string>("customer");
	const navigate = useNavigate();
	const { toast } = useToast();
	const { register } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast({
				title: "Password mismatch",
				description: "Passwords do not match",
				variant: "destructive",
			});
			return;
		}

		if (password.length < 6) {
			toast({
				title: "Password too short",
				description: "Password must be at least 6 characters",
				variant: "destructive",
			});
			return;
		}

		if (isLoading) return;

		setIsLoading(true);
		try {
			await register(email, password, role);
			toast({
				title: "Registration successful",
				description: "Welcome! Your account has been created.",
			});
			navigate("/");
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Registration failed. Please try again.";
			toast({
				title: "Registration failed",
				description: message,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">
						Create Account
					</CardTitle>
					<CardDescription>
						Sign up to start shopping
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleRegister} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="your@email.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Account Type</Label>
							<Select value={role} onValueChange={setRole}>
								<SelectTrigger>
									<SelectValue placeholder="Select account type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="customer">Customer</SelectItem>
									<SelectItem value="store">Store Owner</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="At least 6 characters"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={6}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								minLength={6}
							/>
						</div>
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Creating account..." : "Sign Up"}
					</Button>
					</form>
					<div className="mt-4 text-center">
						<p className="text-sm text-muted-foreground">
							Already have an account?{" "}
							<Link
								to="/login"
								className="text-primary hover:underline font-medium"
							>
								Sign in
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default Register;

