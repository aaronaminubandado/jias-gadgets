import { useEffect, useState, Fragment } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Phone, MapPin } from "lucide-react";
import {
	orderAPI,
	Order,
	FulfillmentStatus,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const PICKUP_STATUSES: FulfillmentStatus[] = [
	"awaiting_fulfillment",
	"ready_for_pickup",
	"completed",
];

const DELIVERY_STATUSES: FulfillmentStatus[] = [
	"awaiting_fulfillment",
	"out_for_delivery",
	"completed",
];

const STATUS_LABELS: Record<FulfillmentStatus, string> = {
	awaiting_payment: "Awaiting payment",
	awaiting_fulfillment: "Awaiting fulfillment",
	ready_for_pickup: "Ready for pickup",
	out_for_delivery: "Out for delivery",
	completed: "Completed",
	cancelled: "Cancelled",
};

function fulfillmentOptions(order: Order): FulfillmentStatus[] {
	if (order.status !== "paid") return [];
	return order.fulfillmentMethod === "delivery"
		? DELIVERY_STATUSES
		: PICKUP_STATUSES;
}

export function StaffOrders() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("all");
	const { toast } = useToast();

	const loadOrders = async () => {
		try {
			setIsLoading(true);
			const response = await orderAPI.getAll({
				limit: 50,
				...(statusFilter !== "all" ? { status: statusFilter } : {}),
				...(fulfillmentFilter !== "all"
					? {
							fulfillmentStatus:
								fulfillmentFilter as FulfillmentStatus,
						}
					: {}),
			});
			setOrders(response.data);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to load orders";
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadOrders();
	}, [statusFilter, fulfillmentFilter]);

	const handleFulfillmentChange = async (
		orderId: string,
		fulfillmentStatus: FulfillmentStatus
	) => {
		try {
			const response = await orderAPI.updateFulfillment(
				orderId,
				fulfillmentStatus
			);
			setOrders((prev) =>
				prev.map((order) =>
					order.id === orderId ? response.data : order
				)
			);
			toast({
				title: "Order updated",
				description: `Fulfillment set to ${STATUS_LABELS[fulfillmentStatus]}`,
			});
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to update order";
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			});
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-3">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-3">
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Payment status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All payments</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="paid">Paid</SelectItem>
						<SelectItem value="failed">Failed</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={fulfillmentFilter}
					onValueChange={setFulfillmentFilter}
				>
					<SelectTrigger className="w-[220px]">
						<SelectValue placeholder="Fulfillment status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All fulfillment</SelectItem>
						<SelectItem value="awaiting_fulfillment">
							Awaiting fulfillment
						</SelectItem>
						<SelectItem value="ready_for_pickup">
							Ready for pickup
						</SelectItem>
						<SelectItem value="out_for_delivery">
							Out for delivery
						</SelectItem>
						<SelectItem value="completed">Completed</SelectItem>
						<SelectItem value="cancelled">Cancelled</SelectItem>
					</SelectContent>
				</Select>
				<Button variant="outline" onClick={loadOrders}>
					Refresh
				</Button>
			</div>

			{orders.length === 0 ? (
				<p className="text-sm text-muted-foreground py-8 text-center">
					No orders match the current filters.
				</p>
			) : (
				<div className="rounded-md border overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-8" />
								<TableHead>Order</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Method</TableHead>
								<TableHead>Payment</TableHead>
								<TableHead>Fulfillment</TableHead>
								<TableHead className="text-right">Total</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.map((order) => {
								const options = fulfillmentOptions(order);
								const isExpanded = expandedId === order.id;

								return (
									<Fragment key={order.id}>
										<TableRow>
											<TableCell>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7"
													onClick={() =>
														setExpandedId(
															isExpanded
																? null
																: order.id
														)
													}
												>
													{isExpanded ? (
														<ChevronDown className="h-4 w-4" />
													) : (
														<ChevronRight className="h-4 w-4" />
													)}
												</Button>
											</TableCell>
											<TableCell className="font-mono text-xs">
												#
												{order.id
													.slice(-8)
													.toUpperCase()}
											</TableCell>
											<TableCell className="text-sm">
												{order.createdAt
													? format(
															new Date(
																order.createdAt
															),
															"MMM d, yyyy"
														)
													: "—"}
											</TableCell>
											<TableCell>
												<div className="text-sm">
													<p className="font-medium">
														{order.customerName ||
															"Guest"}
													</p>
													{(order.phone ||
														order.customerEmail) && (
														<p className="text-xs text-muted-foreground">
															{order.phone ||
																order.customerEmail}
														</p>
													)}
												</div>
											</TableCell>
											<TableCell className="capitalize text-sm">
												{order.fulfillmentMethod ||
													"—"}
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{order.status}
												</Badge>
											</TableCell>
											<TableCell>
												{options.length > 0 ? (
													<Select
														value={
															order.fulfillmentStatus ||
															"awaiting_fulfillment"
														}
														onValueChange={(
															value
														) =>
															handleFulfillmentChange(
																order.id,
																value as FulfillmentStatus
															)
														}
													>
														<SelectTrigger className="w-[180px] h-8">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{options.map(
																(status) => (
																	<SelectItem
																		key={
																			status
																		}
																		value={
																			status
																		}
																	>
																		{
																			STATUS_LABELS[
																				status
																			]
																		}
																	</SelectItem>
																)
															)}
														</SelectContent>
													</Select>
												) : (
													<span className="text-sm text-muted-foreground">
														{order.fulfillmentStatus
															? STATUS_LABELS[
																	order.fulfillmentStatus
																]
															: "—"}
													</span>
												)}
											</TableCell>
											<TableCell className="text-right font-medium">
												$
												{order.totalAmount?.toFixed(2) ||
													"0.00"}
											</TableCell>
										</TableRow>
										{isExpanded && (
											<TableRow>
												<TableCell colSpan={8}>
													<div className="py-3 space-y-3 text-sm">
														<div className="grid gap-2 sm:grid-cols-2">
															{order.phone && (
																<p className="flex items-center gap-2 text-muted-foreground">
																	<Phone className="h-3.5 w-3.5" />
																	{order.phone}
																</p>
															)}
															{order.shippingAddress && (
																<p className="flex items-start gap-2 text-muted-foreground">
																	<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
																	<span>
																		{
																			order
																				.shippingAddress
																				.line1
																		}
																		,{" "}
																		{
																			order
																				.shippingAddress
																				.city
																		}
																	</span>
																</p>
															)}
														</div>
														{order.notes && (
															<p className="italic text-muted-foreground">
																Note: {order.notes}
															</p>
														)}
														<ul className="space-y-1">
															{order.products.map(
																(product) => (
																	<li
																		key={
																			product.productId
																		}
																		className="flex justify-between rounded bg-muted/40 px-3 py-2"
																	>
																		<span>
																			{product.name ||
																				"Product"}{" "}
																			×{" "}
																			{
																				product.quantity
																			}
																		</span>
																		<span>
																			$
																			{product.price.toFixed(
																				2
																			)}
																		</span>
																	</li>
																)
															)}
														</ul>
													</div>
												</TableCell>
											</TableRow>
										)}
									</Fragment>
								);
							})}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
