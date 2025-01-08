import { useState, ChangeEvent } from "react";
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
import { Loader, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { createWalletCookie } from "../actions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WordCount = "12" | "24";

interface SeedPhraseInputsProps {
	words: string[];
	handleWordChange: (index: number, value: string) => void;
	length: 12 | 24;
}

interface WordsMap {
	"12": string[];
	"24": string[];
}

interface SetWordsMap {
	"12": React.Dispatch<React.SetStateAction<string[]>>;
	"24": React.Dispatch<React.SetStateAction<string[]>>;
}

const SeedPhraseInputs: React.FC<SeedPhraseInputsProps> = ({
	words,
	handleWordChange,
	length,
}) => (
	<div className="grid grid-cols-3 gap-3 py-4 max-h-[400px] overflow-y-auto">
		{Array.from({ length }, (_, index) => (
			<div key={index} className="flex items-center gap-1 px-1">
				<span className="text-muted-foreground text-sm">{index + 1}.</span>
				<Input
					value={words[index] || ""}
					onChange={(e) => handleWordChange(index, e.target.value)}
					className="h-8"
					placeholder={`word ${index + 1}`}
				/>
			</div>
		))}
	</div>
);

const ImportWallet: React.FC = () => {
	const [activeTab, setActiveTab] = useState<WordCount>("12");
	const [words12, setWords12] = useState<string[]>(Array(12).fill(""));
	const [words24, setWords24] = useState<string[]>(Array(24).fill(""));
	const [isImporting, setIsImporting] = useState(false);
	const router = useRouter();

	const wordsMap: WordsMap = {
		"12": words12,
		"24": words24,
	};

	const setWordsMap: SetWordsMap = {
		"12": setWords12,
		"24": setWords24,
	};

	const isValid = wordsMap[activeTab].every((word) => word.length >= 3);

	const handleWordChange = (index: number, value: string): void => {
		const setter = setWordsMap[activeTab];
		setter((prev) => {
			const newWords = [...prev];
			newWords[index] = value;
			return newWords;
		});
	};

	const handleFileUpload = async (
		event: ChangeEvent<HTMLInputElement>,
	): Promise<void> => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const words = text
				.trim()
				.split(" ")
				.filter((word) => word.length > 0);

			if (words.length !== 12 && words.length !== 24) {
				toast.error("Invalid seed phrase length. Must be 12 or 24 words.");
				return;
			}

			const wordCount = words.length.toString() as WordCount;
			setActiveTab(wordCount);
			const setter = setWordsMap[wordCount];
			setter(words);
		} catch (error) {
			toast.error("Error reading file");
			console.error(error);
		}
	};

	const handleImportWallet = async (secretKey: string): Promise<void> => {
		setIsImporting(true);
		try {
			const wallet: Wallet = await generateWallet({
				secretKey,
				password: "",
			});
			const account1 = wallet.accounts[0];
			const stxPrivateKey = account1.stxPrivateKey;
			const walletAddress = getAddressFromPrivateKey(account1.stxPrivateKey);
			await setCookie(stxPrivateKey, walletAddress);
		} catch (error) {
			console.error("Error importing wallet:", error);
			toast.error("Invalid seed phrase");
		}
		setIsImporting(false);
	};

	const setCookie = async (
		stxPrivateKey: string,
		walletAddress: string,
	): Promise<void> => {
		try {
			const result = await createWalletCookie(stxPrivateKey, walletAddress);
			if (result.success) {
				router.replace(walletAddress);
			} else {
				toast.error("Something went wrong, please try again later");
				console.error(result.error);
			}
		} catch (error) {
			console.error(error);
			toast.error("Error storing wallet data");
		}
	};

	const handleImport = (): void => {
		const secretKey = wordsMap[activeTab].join(" ");
		handleImportWallet(secretKey);
	};

	return (
		<div className="space-y-2">
			<Label className="text-muted-foreground">
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
							Enter your recovery phrase to import your wallet.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="flex justify-end">
							<div className="relative">
								<input
									type="file"
									accept=".txt"
									onChange={handleFileUpload}
									// className="hidden"
									id="file-upload"
								/>
								<Label htmlFor="file-upload">
									<div className="cursor-pointer inline-block">
										<Button variant="outline" size="sm">
											<Upload className="w-4 h-4 mr-2" />
											Import from file
										</Button>
									</div>
								</Label>
							</div>
						</div>

						<Tabs
							value={activeTab}
							onValueChange={(value: string) =>
								setActiveTab(value as WordCount)
							}
						>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="12">12 Words</TabsTrigger>
								<TabsTrigger value="24">24 Words</TabsTrigger>
							</TabsList>
							<TabsContent value="12">
								<SeedPhraseInputs
									words={words12}
									handleWordChange={handleWordChange}
									length={12}
								/>
							</TabsContent>
							<TabsContent value="24">
								<SeedPhraseInputs
									words={words24}
									handleWordChange={handleWordChange}
									length={24}
								/>
							</TabsContent>
						</Tabs>

						<div className="flex justify-end gap-2">
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button onClick={handleImport} disabled={!isValid || isImporting}>
								Import {isImporting && <Loader className="ml-2 animate-spin" />}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ImportWallet;
