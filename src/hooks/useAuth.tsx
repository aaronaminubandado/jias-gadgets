import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, LoginResponse, RegisterResponse } from "@/lib/api";

interface User {
	email: string;
	role: string;
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string) => Promise<void>;
	logout: () => void;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Load auth state from localStorage on mount
	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedUser = localStorage.getItem("user");

		if (storedToken && storedUser) {
			try {
				const parsedUser = JSON.parse(storedUser);
				// Validate user object shape
				if (parsedUser && typeof parsedUser.email === 'string' && typeof parsedUser.role === 'string') {
					setToken(storedToken);
					setUser(parsedUser);
				} else {
					// Invalid user object structure
					localStorage.removeItem("token");
					localStorage.removeItem("user");
				}
			} catch (error) {
				// Invalid stored data, clear it
				localStorage.removeItem("token");
				localStorage.removeItem("user");
			}
		}
		setIsLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		const response: LoginResponse = await authAPI.login(email, password);
		const userData: User = {
			email: response.email,
			role: response.role,
		};

		setToken(response.token);
		setUser(userData);
		localStorage.setItem("token", response.token);
		localStorage.setItem("user", JSON.stringify(userData));
	};

	const register = async (email: string, password: string) => {
		const response: RegisterResponse = await authAPI.register({
			email,
			password,
		});
		const userData: User = {
			email: response.email,
			role: response.role,
		};

		setToken(response.token);
		setUser(userData);
		localStorage.setItem("token", response.token);
		localStorage.setItem("user", JSON.stringify(userData));
	};

	const logout = () => {
		setToken(null);
		setUser(null);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				login,
				register,
				logout,
				isAuthenticated: !!user && !!token,
				isLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

