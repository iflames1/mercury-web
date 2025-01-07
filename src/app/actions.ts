"use server";
import { cookies } from "next/headers";
import { encrypt, decrypt } from "@/utils/encryption";
import { WalletData } from "@/types/wallet";
import { ENCRYPTION_KEY } from "@/lib/constants";

const WALLET_COOKIE = "walletData";

export async function createWalletCookie(
	stxPrivateKey: string,
	walletAddress: string,
) {
	const cookieStore = await cookies();
	try {
		console.log("saving cookie");

		if (!stxPrivateKey || !walletAddress) {
			throw new Error("Missing required wallet data");
		}

		const encryptedKey = await encrypt(stxPrivateKey, ENCRYPTION_KEY);

		const walletData = {
			stxPrivateKey: encryptedKey,
			walletAddress,
		};

		cookieStore.set({
			name: WALLET_COOKIE,
			value: JSON.stringify(walletData),
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		return { success: true };
	} catch (error) {
		console.error("Error storing wallet data:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Failed to store wallet data",
		};
	}
}

export async function getWalletCookie(): Promise<WalletData | null> {
	try {
		const cookieStore = await cookies();
		const data = cookieStore.get(WALLET_COOKIE);

		if (!data || !data.value) {
			console.log("No wallet cookie found");
			return null;
		}

		const walletData = JSON.parse(data.value) as {
			stxPrivateKey: string;
			walletAddress: string;
		};

		if (!walletData.stxPrivateKey || !walletData.walletAddress) {
			console.log("Invalid wallet data structure");
			return null;
		}

		// Decrypt the private key
		const decryptedPrivateKey = await decrypt(
			walletData.stxPrivateKey,
			ENCRYPTION_KEY,
		);

		return {
			stxPrivateKey: decryptedPrivateKey,
			walletAddress: walletData.walletAddress,
		};
	} catch (error) {
		console.error("Error retrieving wallet data:", error);
		return null;
	}
}
