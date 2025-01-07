import { Card, CardContent } from "@/components/ui/card";

import React from "react";
import { getWalletCookie } from "../actions";
import { redirect } from "next/navigation";
import { getSTXBalance } from "@/queries/balance";
import WalletAddress from "./_components/wallet-balance";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ address: string }>;
}) {
	const address = (await params).address;
	const walletData = await getWalletCookie();
	const balance = await getSTXBalance(address);

	if (!walletData || walletData.walletAddress !== address) {
		redirect("/");
	}

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-2xl mx-auto space-y-6">
				<Card>
					<CardContent className="pt-6 space-y-4">
						<div>
							<WalletAddress address={address} />
						</div>
						<div>
							<div className="text-sm text-muted-foreground">Total Balance</div>
							<div className="text-3xl font-bold mt-1">
								{balance.toLocaleString()} STX
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
