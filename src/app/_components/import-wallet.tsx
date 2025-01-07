import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { generateWallet, Wallet } from "@stacks/wallet-sdk";
import { getAddressFromPrivateKey } from "@stacks/transactions";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { createWalletCookie } from "../actions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function ImportWallet() {
	const [words, setWords] = useState(Array(12).fill(""));
	const [isImporting, setIsImporting] = useState(false);
	const router = useRouter();

	const isValid = words.every((word) => word.length >= 3);

	const handleWordChange = (index: number, value: string) => {
		const newWords = [...words];
		newWords[index] = value;
		setWords(newWords);
	};

	const handleImportWallet = async (secretKey: string) => {
		setIsImporting(true);
		try {
			const wallet: Wallet = await generateWallet({
				secretKey,
				password: "",
			});
			const account1 = wallet.accounts[0];
			const stxPrivateKey = account1.stxPrivateKey;
			const walletAddress = getAddressFromPrivateKey(account1.stxPrivateKey);
			setCookie(stxPrivateKey, walletAddress);
		} catch (error) {
			console.error("Error importing wallet:", error);
		}
		setIsImporting(false);
	};

	const setCookie = async (stxPrivateKey: string, walletAddress: string) => {
		console.log(stxPrivateKey, walletAddress);
		try {
			const result = await createWalletCookie(stxPrivateKey, walletAddress);
			if (result.success) {
				router.replace(walletAddress);
			} else {
				toast.error("Something went wrong, please try again later");
				console.log(result.error);
			}
		} catch (error) {
			console.log(error);
			toast.error("Error storing wallet data");
		}
	};

	const handleImport = () => {
		const secretKey = words.join(" ");
		handleImportWallet(secretKey);
		console.log("Secret Key:", secretKey);
	};

	return (
		<div className="space-y-2">
			<Label className="text-muted-foreground">
				{" "}
				Use an existing Stacks wallet
			</Label>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline" size="lg" className="w-full">
						Import Wallet
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Import Wallet</DialogTitle>
						<DialogDescription>
							Enter your 12-word recovery phrase to import your wallet.
						</DialogDescription>
					</DialogHeader>

					<div className="grid grid-cols-3 gap-3 py-4">
						{words.map((word, index) => (
							<div key={index} className="flex items-center gap-1 py-2 px-1">
								<span className="text-muted-foreground text-sm">
									{index + 1}.
								</span>
								<Input
									value={word}
									onChange={(e) => handleWordChange(index, e.target.value)}
									className="h-8"
									placeholder={`word ${index + 1}`}
								/>
							</div>
						))}
					</div>

					<div className="flex justify-end gap-2">
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button onClick={handleImport} disabled={!isValid || isImporting}>
							Import {isImporting && <Loader className={"animate-spin"} />}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
