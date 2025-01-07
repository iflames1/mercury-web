"use client";

import React from "react";
import { validateStacksAddress } from "@stacks/transactions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Token } from "@/types/token";
import { TabsContent } from "@/components/ui/tabs";
import { Loader } from "lucide-react";

const createFormSchema = (balance: string) =>
	z.object({
		receiverAddr: z
			.string()
			.min(1, "Receiver address is required")
			.refine((address) => validateStacksAddress(address), {
				message: "Invalid Stacks address",
			}),
		memo: z.string().optional(),
		amount: z
			.string()
			.min(1, "Amount is required")
			.regex(/^\d+(\.\d+)?$/, "Invalid amount")
			.refine((val) => Number(val) <= Number(balance), {
				message: "Amount exceeds available balance",
			}),
	});

interface TransferProps {
	tokenData: Token;
}

export function Transfer({ tokenData }: TransferProps) {
	const tokenBalance = "100";
	// const tokenBalance = tokenData.formattedBalAmt.toString()
	const FormSchema = createFormSchema(tokenBalance);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			receiverAddr: "SPQ9B3SYFV0AFYY96QN5ZJBNGCRRZCCMFHY0M34Z",
			memo: "",
			amount: "1",
		},
	});

	async function onSubmit(values: z.infer<typeof FormSchema>) {
		try {
			// Here you would handle the transfer logic
			console.log("Transfer data:", values);

			// Simulating an API call
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Handle success (e.g., show a success message, navigate to a new page, etc.)
		} catch (err) {
			console.error("Transfer error:", err);
			// Handle error (e.g., show error message)
		}
	}

	const handleMaxPress = () => {
		form.setValue("amount", tokenBalance, { shouldValidate: true });
	};

	return (
		<TabsContent value="transfer" className="mt-3">
			<Card className="w-full mx-auto">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-2">
						<Image
							src={tokenData.image}
							alt={tokenData.symbol}
							width={50}
							height={50}
							className="rounded-full"
						/>
					</div>
					<h2 className="text-2xl font-bold">Transfer {tokenData.symbol}</h2>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="receiverAddr"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Receiver Address</FormLabel>
										<FormControl>
											<Input placeholder="SP3RTF...XPTPMZ9" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="memo"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Memo (optional)</FormLabel>
										<FormControl>
											<Textarea placeholder="Add a memo" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{tokenData.symbol} Amount</FormLabel>
										<FormDescription>
											Balance: {tokenBalance} {tokenData.symbol}
										</FormDescription>
										<FormControl>
											<div className="relative">
												<Input
													placeholder="0.00"
													{...field}
													className="pr-16"
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full"
													onClick={handleMaxPress}
												>
													MAX
												</Button>
											</div>
										</FormControl>
										<FormDescription className="text-right">
											{/* ≈ ${(Number(tokenData.currentPrice) * Number(field.value)).toFixed(2)} USD */}
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-between items-center">
								<div>
									<p className="font-medium">Network Fee</p>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">High</span>
										<Button variant="link" size="sm" className="p-0 h-auto">
											Edit
										</Button>
									</div>
								</div>
								<p className="font-medium">0.001 STX</p>
							</div>
							<Button
								type="submit"
								className="w-full gap-3"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting && (
									<Loader className="animate-spin" size={17} />
								)}
								{form.formState.isSubmitting ? "Processing..." : "Transfer"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</TabsContent>
	);
}
