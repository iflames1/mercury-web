/* eslint-disable */
"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Wallet } from "lucide-react";
import { StxCityTokenInfo } from "@/types/token";
import { AccountBalance } from "@/types/balance";
import { WalletData } from "@/types/wallet";
import {
	contractPrincipalCV,
	uintCV,
	Pc,
	broadcastTransaction,
	makeContractCall,
	SignedContractCallOptions,
} from "@stacks/transactions";
import { getBuyableTokens } from "@/lib/contract-calls/stxcity";
import { EXPLORER_BASE_URL } from "@/lib/constants";
import { toast } from "sonner";

interface StxCityBuyProps {
	token: StxCityTokenInfo;
	balance: AccountBalance;
	walletData: WalletData;
}

const INITIAL_SLIPPAGE = "0.5";
const STX_PRICE_OPTIONS = [
	{ value: "10", display: "10" },
	{ value: "15", display: "15" },
	{ value: "25", display: "20" },
	{ value: "30", display: "30" },
	{ value: "50", display: "50" },
	{ value: "75", display: "75" },
	{ value: "100", display: "100" },
];
const DECIMAL_REGEX = /^\d*\.?\d*$/;
const SLIPPAGE_REGEX = /^\d*\.?\d{0,2}$/;

export default function StxCityBuy({
	token,
	balance,
	walletData,
}: StxCityBuyProps) {
	const stxBal = Number(balance.stx.balance) / 1_000_000;
	const [stxPrice, setStxPrice] = useState("0.00001");
	const [slippage, setSlippage] = useState(INITIAL_SLIPPAGE);
	const [buyableAmount, setBuyableAmount] = useState("0");
	const [isLoading, setIsLoading] = useState(false);
	const [txID, setTxID] = useState("");

	const dexContract = useMemo(
		() => token.dex_contract.split("."),
		[token.dex_contract],
	);
	const tokenContract = useMemo(
		() => token.token_contract.split("."),
		[token.token_contract],
	);

	const calculateBuyableTokens = useCallback(
		async (amountStr: string) => {
			if (!amountStr || isNaN(Number(amountStr))) return;

			setIsLoading(true);
			try {
				const amountNum = Number.parseFloat(amountStr);
				const amount = Math.floor(amountNum * 10 ** 6);

				const buyableToken = await getBuyableTokens(
					dexContract,
					walletData.walletAddress,
					amount,
				);

				if (buyableToken) {
					const buyableTokenAmount =
						buyableToken?.type === "ok"
							? // @ts-expect-error "value typechecking"
								buyableToken.value.value["buyable-token"].value
							: BigInt(0);
					const readableValue =
						Number(buyableTokenAmount) / 10 ** token.decimals;
					setBuyableAmount(readableValue.toFixed(4));
				}
			} catch (error) {
				console.error("Error calculating buyable tokens:", error);
				setBuyableAmount("0");
			} finally {
				setIsLoading(false);
			}
		},
		[dexContract, walletData.walletAddress, token.decimals],
	);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (stxPrice) {
				calculateBuyableTokens(stxPrice);
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [stxPrice, calculateBuyableTokens]);

	const handlePriceChange = useCallback((value: string) => {
		if (value === "" || DECIMAL_REGEX.test(value)) {
			setStxPrice(value);
		}
	}, []);

	const handleSlippageChange = useCallback((value: string) => {
		if (value === "" || SLIPPAGE_REGEX.test(value)) {
			setSlippage(value);
		}
	}, []);

	const handleBuy = useCallback(async () => {
		setIsLoading(true);
		try {
			const uintCvAmount = Number.parseFloat(stxPrice) * 10 ** 6;
			const buyableAmountForPostCondition = BigInt(
				Math.floor(Number(buyableAmount) * 10 ** token.decimals),
			);

			const functionArgs = [
				contractPrincipalCV(tokenContract[0], tokenContract[1]),
				uintCV(uintCvAmount),
			];

			const postConditions = [
				Pc.principal(walletData.walletAddress).willSendEq(uintCvAmount).ustx(),
				Pc.principal(dexContract[0] + "." + dexContract[1])
					.willSendGte(buyableAmountForPostCondition)
					.ft(`${tokenContract[0]}.${tokenContract[1]}`, token.symbol),
			];

			const txOptions: SignedContractCallOptions = {
				contractAddress: dexContract[0],
				contractName: dexContract[1],
				functionName: "buy",
				functionArgs,
				postConditions,
				validateWithAbi: true,
				fee: Math.floor(0.001 * 1000000),
				senderKey: walletData.stxPrivateKey,
			};

			const tx = await makeContractCall(txOptions);

			const res = await broadcastTransaction({
				transaction: tx,
				network: "mainnet",
			});
			if ("reason" in res) {
				toast.error(res.reason, {
					richColors: true,
				});
			} else {
				console.log("Transaction broadcast success:", res.txid);
				setTxID(res.txid);
				toast.success("Transaction Broadcasted", {
					richColors: true,
					description: <p className="text-muted-foreground ">TXID: {txID}</p>,
					action: (
						<Button asChild>
							<a
								href={`${EXPLORER_BASE_URL}txid/${res.txid}?chain=mainnet`}
								target="_blank"
							>
								Open In Explorer
							</a>
						</Button>
					),
				});
			}
		} catch (err) {
			console.error("Error in handleBuy:", err);
		} finally {
			setIsLoading(false);
		}
	}, [
		stxPrice,
		buyableAmount,
		dexContract,
		tokenContract,
		walletData,
		token.symbol,
		token.decimals,
	]);

	const receiveText = useMemo(
		() =>
			isLoading
				? "Calculating..."
				: `Would receive min ${buyableAmount} ${token.symbol}`,
		[isLoading, buyableAmount, token.symbol],
	);

	return (
		<TabsContent value="buy" className="mt-4 space-y-4">
			<div className="flex justify-between items-center">
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Image
							src="/stacks-logo.png"
							alt="Stacks Logo"
							width={20}
							height={20}
							className="rounded-full"
						/>
						<h4>STX</h4>
					</div>
					<div className="flex items-center gap-1">
						<Wallet className="text-primary" strokeWidth={1.25} size={14} />
						<span>{`${(Number(balance?.stx?.balance) / 1_000_000).toFixed(4)} STX`}</span>
					</div>
				</div>
				<Input
					placeholder="0"
					value={stxPrice}
					onChange={(e) => handlePriceChange(e.target.value)}
					type="number"
					className="w-1/2"
				/>
			</div>

			<div className="flex justify-center items-center gap-3">
				{STX_PRICE_OPTIONS.map((option) => (
					<Button
						key={option.value}
						className="w-full"
						variant="secondary"
						onClick={() => setStxPrice(option.value)}
					>
						{option.display}
					</Button>
				))}
				<Button
					className="w-full"
					variant="secondary"
					onClick={() => setStxPrice(stxBal.toString())}
				>
					MAX
				</Button>
			</div>

			<div className="flex justify-between items-center">
				<h4>Slippage (%)</h4>
				<Input
					placeholder={INITIAL_SLIPPAGE}
					value={slippage}
					onChange={(e) => handleSlippageChange(e.target.value)}
					type="number"
					className="w-1/2"
				/>
			</div>

			<div>
				<p>{receiveText}</p>
			</div>

			<Button
				onClick={handleBuy}
				disabled={isLoading || !stxPrice || Number(stxPrice) <= 0}
				className="w-full"
			>
				{isLoading ? "Calculating..." : "Buy"}
			</Button>
		</TabsContent>
	);
}
