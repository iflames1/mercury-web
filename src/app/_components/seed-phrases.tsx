import React from "react";
import { Eye, EyeOff, Loader2, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createWalletCookie } from "../actions";

interface SeedPhraseProps {
	seedPhrase: string;
	walletAddress: string;
	stxPrivateKey: string;
	isGenerating: boolean;
}

export default function SeedPhrase({
	seedPhrase,
	walletAddress,
	stxPrivateKey,
	isGenerating,
}: SeedPhraseProps) {
	const [isHidden, setIsHidden] = useState(false);
	const router = useRouter();
	const phrases = seedPhrase.split(" ");

	const copyToClipboard = async () => {
		await navigator.clipboard.writeText(seedPhrase);
		toast.success("Recovery phrase copied to clipboard", {
			duration: 2000,
		});
	};

	const setCookie = async () => {
		try {
			const result = await createWalletCookie(stxPrivateKey, walletAddress);
			if (result.success) {
				router.replace(walletAddress);
			} else {
				toast.error("Something went wrong, please try again later", {
					duration: 2000,
				});
				console.log(result.error);
			}
		} catch (error) {
			console.log(error);
			toast.error("Error storing wallet data");
		}
	};

	if (isGenerating) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Button
				variant="ghost"
				size="sm"
				className="w-full"
				onClick={() => setIsHidden(!isHidden)}
			>
				{isHidden ? (
					<Eye className="h-4 w-4 mr-2" />
				) : (
					<EyeOff className="h-4 w-4 mr-2" />
				)}
				{isHidden ? "Show Recovery Phrase" : "Hide Recovery Phrase"}
			</Button>

			<div className="grid grid-cols-3 gap-2">
				{phrases.map((phrase, index) => (
					<div
						key={index}
						className="p-2 border rounded flex items-center gap-2"
					>
						<span className="text-muted-foreground text-sm">{index + 1}.</span>
						<span className="font-mono">{isHidden ? "****" : phrase}</span>
					</div>
				))}
			</div>

			<div className="flex gap-2 justify-end">
				<Button variant="outline" onClick={copyToClipboard}>
					<Copy className="h-4 w-4 mr-2" />
					Copy
				</Button>
				<Button variant={"default"} onClick={setCookie}>
					Continue
				</Button>
			</div>
		</div>
	);
}
