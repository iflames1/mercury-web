"use client";
import React from "react";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function WalletAddress({ address }: { address: string }) {
	const [hasCopied, setHasCopied] = useState(false);

	const copyToClipboard = async () => {
		await navigator.clipboard.writeText(address);
		setHasCopied(true);
		toast.info("Address copied to clipboard", {
			duration: 2000,
		});

		// Reset icon after 2 seconds
		setTimeout(() => {
			setHasCopied(false);
		}, 2000);
	};

	return (
		<HoverCard>
			<HoverCardTrigger
				asChild
				onClick={() => {
					copyToClipboard();
				}}
			>
				<p className="cursor-pointer flex items-center gap-2 flex-1 bg-background rounded font-mono hover:underline hover:text-primary transition-colors group">
					<span className="truncate hidden sm:inline">{address}</span>
					<span className="inline sm:hidden">
						{address.slice(0, 7) + "..." + address.slice(-7)}
					</span>
					{hasCopied ? (
						<Check className="size-3 opacity-70" />
					) : (
						<Copy className="size-3 opacity-70 group-hover:inline-flex hidden" />
					)}
				</p>
			</HoverCardTrigger>
			<HoverCardContent className="w-auto">
				<Link
					href={`https://explorer.hiro.so/address/${address}?chain=mainnet`}
					className="text-sm hover:underline hover:text-primary transition-colors group"
				>
					View on Stacks Explorer
				</Link>
			</HoverCardContent>
		</HoverCard>
	);
}
