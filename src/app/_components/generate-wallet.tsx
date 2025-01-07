import React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { generateWallet, generateSecretKey, Wallet } from "@stacks/wallet-sdk";
import { getAddressFromPrivateKey } from "@stacks/transactions";
import SeedPhrase from "./seed-phrases";
import { Label } from "@/components/ui/label";

export default function GenerateWallet() {
	const [isGenerating, setIsGenerating] = useState(false);
	const [secretKey, setSecretKey] = useState("");
	const [walletAddress, setWalletAddress] = useState("");
	const [stxPrivateKey, setStxPrivateKey] = useState("");

	const handleGenerateWallet = async () => {
		setIsGenerating(true);
		try {
			const secretKey = generateSecretKey(128);
			const wallet: Wallet = await generateWallet({
				secretKey,
				password: "",
			});
			const account1 = wallet.accounts[0];
			const mainnetAddress = getAddressFromPrivateKey(account1.stxPrivateKey);
			setWalletAddress(mainnetAddress);
			setSecretKey(secretKey);
			setStxPrivateKey(account1.stxPrivateKey);
		} catch (error) {
			console.error("Error generating wallet:", error);
		}
		setIsGenerating(false);
	};

	return (
		<div className="space-y-2">
			<Label className="text-muted-foreground">
				Create a new wallet for Mercury
			</Label>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant="default"
						size="lg"
						className="w-full relative"
						disabled={isGenerating}
					>
						<span>Generate Wallet</span>
						<span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
							Suggested
						</span>
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-yellow-500" />
							Important Security Notice
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-3">
							<p>
								You are about to view your wallet&apos;s recovery phrase. This
								is a series of words that gives complete access to your wallet.
							</p>
							<ul className="list-disc list-inside space-y-1 text-start">
								<li>Make sure no one can see your screen</li>
								<li>Have a pen and paper ready to write it down</li>
								<li>Never share these words with anyone</li>
								<li>Store them in a secure location</li>
							</ul>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Dialog>
								<DialogTrigger>
									<Button
										disabled={isGenerating}
										onClick={async () => await handleGenerateWallet()}
										className="w-full"
									>
										I understand, continue
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Your Recovery Phrase</DialogTitle>
										<DialogDescription>
											Write down these 12 words in order and store them safely.
										</DialogDescription>
									</DialogHeader>

									<SeedPhrase
										seedPhrase={secretKey}
										walletAddress={walletAddress}
										stxPrivateKey={stxPrivateKey}
										isGenerating={isGenerating}
									/>
								</DialogContent>
							</Dialog>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
