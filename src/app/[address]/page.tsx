import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { getWalletCookie } from "../actions";
import { redirect } from "next/navigation";
import { getSTXBalance, getTokenBalances } from "@/queries/balance";
import WalletAddress from "./_components/wallet-address";
import TokenList from "./_components/token-list";
import { AccountBalance } from "@/types/balance";
export default async function DashboardPage({
	params,
}: {
	params: Promise<{ address: string }>;
}) {
	const address = (await params).address;
	const walletData = await getWalletCookie();
	const balanceData = await getSTXBalance(address);
	const stxBalance = Number(balanceData?.stx.balance) / 1_000_000;
	const tokens = await getTokenBalances(walletData?.walletAddress as string);

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
								{stxBalance.toLocaleString()} STX
							</div>
						</div>
					</CardContent>
				</Card>
				<TokenList
					tokens={tokens}
					walletData={walletData}
					balanceData={balanceData as AccountBalance}
				/>
			</div>
		</div>
	);
}
