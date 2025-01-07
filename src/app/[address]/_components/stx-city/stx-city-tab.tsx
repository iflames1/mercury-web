"use client";
import { Progress } from "@/components/ui/progress";
import { CircleDollarSign, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { StxCityTokenInfo } from "@/types/token";
import { WalletData } from "@/types/wallet";
import { useState } from "react";
import { AccountBalance } from "@/types/balance";
import StxCityBuy from "./buy";
import { truncateContract } from "@/utils/truncate";
import StxCitySell from "./sell";

interface ItemStatProps {
	icon: React.ElementType;
	title: string;
	val: number;
}

const ItemStat = ({ icon: Icon, title, val }: ItemStatProps) => {
	return (
		<div className="flex flex-col gap-0 flex-1">
			<div className="flex items-center gap-1">
				<Icon className="text-primary" strokeWidth={1.25} />
				<span>{title}</span>
			</div>
			<span className="text-lg font-light">${val.toLocaleString()}</span>
		</div>
	);
};

interface StxCityTabProps {
	token: StxCityTokenInfo;
	walletData: WalletData;
	balanceData: AccountBalance;
}

export default function StxCityTab({
	token,
	walletData,
	balanceData,
}: StxCityTabProps) {
	const [activeTab, setActiveTab] = useState("buy");

	if (!token) {
		return <div>This token was not listed on stx.city</div>;
	}

	return (
		<TabsContent value="stxcity" className="mt-3">
			<Card>
				<CardHeader>
					<div className="flex gap-4 items-center">
						<Image
							src={token.logo_url}
							alt={token.name}
							width={50}
							height={50}
							className="rounded-full"
						/>
						<div>
							<h4 className="font-semibold uppercase">{token.name}</h4>
							<div>
								<span className="font-medium">Ticker: {token.symbol}</span>
								<span className="font-medium ml-2">
									Supply: {token.supply.toLocaleString()}
								</span>
							</div>
						</div>
					</div>
					<p className="text-muted-foreground">{token.description}</p>
					<div className="flex flex-col gap-1">
						<span className="text-green-400">
							{Math.ceil(token.progress)}%{" "}
							{((token.progress / 100) * token.target_stx).toFixed(4)} of{" "}
							{token.target_stx.toLocaleString()} STX
						</span>
						<Progress value={token.progress} max={100} />
					</div>
				</CardHeader>
				<CardContent>
					<Collapsible>
						<CollapsibleTrigger asChild>
							<Button variant="secondary">Read More</Button>
						</CollapsibleTrigger>
						<CollapsibleContent className="flex flex-col gap-2 mt-3">
							<div className="flex flex-col gap-0 items-start my-3">
								<Button
									variant="link"
									onClick={() =>
										navigator.clipboard.writeText(token.token_contract)
									}
									className="p-0"
								>
									Token Contract: {truncateContract(token.token_contract)}
								</Button>
								<Button
									variant="link"
									className="p-0"
									onClick={() =>
										navigator.clipboard.writeText(token.dex_contract)
									}
								>
									Dex Contract: {truncateContract(token.dex_contract)}
								</Button>
							</div>
							<div className="flex gap-4 justify-between">
								<ItemStat
									icon={TrendingUp}
									title="Market Capital"
									val={token.stx_paid * token.supply}
								/>
								<ItemStat
									icon={CircleDollarSign}
									title="Price"
									val={token.stx_paid}
								/>
							</div>
							<div className="flex gap-4 justify-between">
								<ItemStat
									icon={TrendingUp}
									title="Volume"
									val={token.trading_volume}
								/>
								<ItemStat
									icon={TrendingUp}
									title="Market Capital"
									val={token.trading_volume}
								/>
							</div>
						</CollapsibleContent>
					</Collapsible>
				</CardContent>
				{token.progress !== 100 && (
					<CardFooter>
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="w-full"
						>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="buy">Buy</TabsTrigger>
								<TabsTrigger value="sell" className="text-destructive">
									Sell
								</TabsTrigger>
							</TabsList>
							<StxCityBuy
								token={token}
								balance={balanceData}
								walletData={walletData}
							/>
							<StxCitySell
								token={token}
								balance={balanceData}
								walletData={walletData}
							/>
						</Tabs>
					</CardFooter>
				)}
			</Card>
		</TabsContent>
	);
}
