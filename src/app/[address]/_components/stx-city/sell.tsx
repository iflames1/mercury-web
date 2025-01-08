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
import { getSellableTokens } from "@/lib/contract-calls/stxcity";
import { toast } from "sonner";
import { EXPLORER_BASE_URL } from "@/lib/constants";

interface StxCitySellProps {
	token: StxCityTokenInfo;
	balance: AccountBalance;
	walletData: WalletData;
}

const INITIAL_SLIPPAGE = "0.5";
const PERCENTAGE_OPTIONS = [
	{ value: "10" },
	{ value: "25" },
	{ value: "50" },
	{ value: "75" },
	{ value: "100" },
];
const DECIMAL_REGEX = /^\d*\.?\d*$/;
const SLIPPAGE_REGEX = /^\d*\.?\d{0,2}$/;

export default function StxCitySell({
	token,
	balance,
	walletData,
}: StxCitySellProps) {
	const [tokenAmount, setTokenAmount] = useState("5");
	const [slippage, setSlippage] = useState(INITIAL_SLIPPAGE);
	const [sellableAmount, setSellableAmount] = useState("0");
	const [isLoading, setIsLoading] = useState(false);
	const [txID, setTxID] = useState("");

	const matchingKey = Object.keys(balance.fungible_tokens).find((key) =>
		key.startsWith(token.token_contract),
	);
	const tokenBalance = matchingKey
		? balance.fungible_tokens[matchingKey].balance
		: "0";
	const formattedTokenBalance = useMemo(
		() => (tokenBalance ? Number(tokenBalance) / 10 ** token.decimals : 0),
		[tokenBalance, token.decimals],
	);

	const dexContract = useMemo(
		() => token.dex_contract.split("."),
		[token.dex_contract],
	);
	const tokenContract = useMemo(
		() => token.token_contract.split("."),
		[token.token_contract],
	);

	const handlePercentageSelect = useCallback(
		(percentage: string) => {
			const amount = (
				(Number(percentage) / 100) *
				formattedTokenBalance
			).toFixed(4);
			setTokenAmount(amount);
		},
		[formattedTokenBalance],
	);

	const calculateReceivableStx = useCallback(
		async (amountStr: string) => {
			if (!amountStr || isNaN(Number(amountStr))) return;

			setIsLoading(true);
			try {
				const amountNum = Number.parseFloat(amountStr);
				const amount = Math.floor(amountNum * 10 ** 6);

				if (isNaN(amountNum) || amountNum <= 0) {
					setSellableAmount("0");
					return;
				}

				const response = await getSellableTokens(
					dexContract,
					walletData.walletAddress,
					amount,
				);

				if (!response) {
					throw new Error("Failed to fetch sellable tokens");
				}

				if (
					response.type === "ok" &&
					// @ts-expect-error "value typechecking"
					response.value?.value?.["receivable-stx"]?.value
				) {
					const receivableStx = BigInt(
						// @ts-expect-error "value typechecking"
						response.value.value["receivable-stx"].value,
					);
					const readableValue = Number(receivableStx) / 10 ** 6;
					setSellableAmount(readableValue.toFixed(4));
				} else {
					throw new Error("Invalid response format from contract");
				}
			} catch (error) {
				console.error("Error calculating sellable tokens:", error);
				setSellableAmount("0");
			} finally {
				setIsLoading(false);
			}
		},
		[dexContract, walletData.walletAddress],
	);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (tokenAmount) {
				calculateReceivableStx(tokenAmount);
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [tokenAmount, calculateReceivableStx]);

	const handlePriceChange = useCallback((value: string) => {
		if (value === "" || DECIMAL_REGEX.test(value)) {
			setTokenAmount(value);
		}
	}, []);

	const handleSlippageChange = useCallback((value: string) => {
		if (value === "" || SLIPPAGE_REGEX.test(value)) {
			setSlippage(value);
		}
	}, []);

	const handleSell = useCallback(async () => {
		setIsLoading(true);
		try {
			const uintCvAmount = Number.parseFloat(tokenAmount) * 10 ** 6;
			const decimals = token.decimals ? token.decimals : 6;
			const expectedStxUintCv = BigInt(
				Math.floor(Number(sellableAmount) * 10 ** decimals),
			);

			const functionArgs = [
				contractPrincipalCV(tokenContract[0], tokenContract[1]),
				uintCV(uintCvAmount),
			];

			const postConditions = [
				Pc.principal(dexContract[0] + "." + dexContract[1])
					.willSendGte(expectedStxUintCv)
					.ustx(),
				Pc.principal(walletData.walletAddress)
					.willSendEq(uintCvAmount)
					.ft(`${tokenContract[0]}.${tokenContract[1]}`, token.symbol),
			];

			const txOptions: SignedContractCallOptions = {
				contractAddress: dexContract[0],
				contractName: dexContract[1],
				functionName: "sell",
				functionArgs,
				postConditions,
				validateWithAbi: true,
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
								href={`${EXPLORER_BASE_URL}/txid/${res.txid}?chain=mainnet`}
								target="_blank"
							>
								Open In Explorer
							</a>
						</Button>
					),
				});
			}
		} catch (err) {
			console.error("Error in handleSell:", err);
		} finally {
			setIsLoading(false);
		}
	}, [
		tokenAmount,
		sellableAmount,
		dexContract,
		tokenContract,
		walletData,
		token.symbol,
		token.decimals,
		txID,
	]);

	const receiveText = useMemo(
		() =>
			isLoading ? "Calculating..." : `Would receive min ${sellableAmount} STX`,
		[isLoading, sellableAmount],
	);

	return (
		<TabsContent value="sell" className="mt-4 space-y-4">
			<div className="flex justify-between items-center">
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Image
							src={token.logo_url}
							alt={token.name}
							width={20}
							height={20}
							className="rounded-full"
						/>
						<h4>{token.symbol}</h4>
					</div>
					<div className="flex items-center gap-1">
						<Wallet className="text-primary" strokeWidth={1.25} size={14} />
						<span>{`${(Number(tokenBalance) / 10 ** token.decimals).toFixed(4)} ${token.symbol}`}</span>
					</div>
				</div>
				<Input
					placeholder="0"
					value={tokenAmount}
					onChange={(e) => handlePriceChange(e.target.value)}
					type="number"
					className="w-1/2"
				/>
			</div>

			<div className="flex justify-center items-center gap-3">
				{PERCENTAGE_OPTIONS.map((option) => (
					<Button
						key={option.value}
						variant="secondary"
						className="w-full"
						onClick={() => handlePercentageSelect(option.value)}
					>
						{option.value} %
					</Button>
				))}
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
				onClick={handleSell}
				disabled={isLoading || !tokenAmount || Number(tokenAmount) <= 0}
				className="w-full"
			>
				{isLoading ? "Calculating..." : "Sell"}
			</Button>
		</TabsContent>
	);
}
