"use client";
import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
// import TokenDetails from "./token-details";
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
import { TabsContent } from "@radix-ui/react-tabs";
import { Transfer } from "./transfer";

const mockTokens: Token[] = [
	{
		symbol: "WELSH",
		balance: "1000",
		worth: 500,
		image: "/tokens/welsh.png",
		name: "WELSH Corgil",
	},
	{
		symbol: "MEME",
		balance: "5000",
		worth: 750,
		image: "/tokens/meme.png",
		name: "MEME",
	},
	{
		symbol: "POMBOO",
		balance: "200",
		worth: 300,
		image: "/tokens/pomboo.png",
		name: "Pomboomerian",
	},
];

export default function TokenList({
	tokens,
	balanceData,
	walletData,
}: {
	tokens: Token[];
	walletData: WalletData;
	balanceData: AccountBalance;
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedToken, setSelectedToken] = useState<Token | null>(null);

	return (
		<>
			{/* <div className="relative"> */}
			{/* 	<SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /> */}
			{/* 	<Input */}
			{/* 		placeholder="Search token" */}
			{/* 		className="pl-9" */}
			{/* 		value={searchQuery} */}
			{/* 		onChange={(e) => { */}
			{/* 			setSearchQuery(e.target.value); */}
			{/* 			const found = mockTokens.find((t) => */}
			{/* 				t.symbol.toLowerCase().includes(e.target.value.toLowerCase()), */}
			{/* 			); */}
			{/* 			setSelectedToken(found || null); */}
			{/* 		}} */}
			{/* 	/> */}
			{/* </div> */}
			{selectedToken ? (
				<>
					{/* <TokenDetails token={selectedToken} walletData={walletData} /> */}
				</>
			) : (
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
			)}
		</>
	);
}
