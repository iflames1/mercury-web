"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { WalletData } from "@/types/wallet";
import { StxCityTokenInfo, Token } from "@/types/token";
import { AccountBalance } from "@/types/balance";
import StxCityTab from "./stx-city/stx-city-tab";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Transfer } from "./transfer";

export default function TokenList({
	tokens,
	balanceData,
	walletData,
}: {
	tokens: Token[];
	walletData: WalletData;
	balanceData: AccountBalance;
}) {
	return (
		<div className="space-y-4">
			{tokens.map((token) => (
				<Card key={token.symbol}>
					<Collapsible>
						<CollapsibleTrigger asChild>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="relative h-10 w-10">
											<Image
												src={token.image}
												alt={token.symbol}
												fill
												className="rounded-full"
											/>
										</div>
										<div>
											<div className="font-medium">{token.symbol}</div>
											<div className="text-sm text-muted-foreground">
												{token.worth} STX
											</div>
										</div>
									</div>
									<div className="text-right space-x-1">
										<span className="font-medium">{token.balance}</span>
										<span className="text-muted-foreground">
											{token.symbol}
										</span>
									</div>
								</div>
							</CardHeader>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<CardContent className="">
								<Tabs defaultValue="stxcity">
									<TabsList className="grid w-full grid-cols-2">
										<TabsTrigger value="stxcity">StCity</TabsTrigger>
										<TabsTrigger value="transfer">Transfer</TabsTrigger>
									</TabsList>
									{token && (
										<StxCityTab
											token={token.stxcity as StxCityTokenInfo}
											walletData={walletData}
											balanceData={balanceData}
										/>
									)}
									<Transfer tokenData={token} />
								</Tabs>
							</CardContent>
						</CollapsibleContent>
					</Collapsible>
				</Card>
			))}
		</div>
	);
}
