import { HIRO_API_BASE_URL } from "@/lib/constants";
import { AccountBalance } from "@/types/balance";
import { Token, TokenMetadata } from "@/types/token";
import { getTokenMetadataFromSTXCity } from "./tokens";

export async function getSTXBalance(
	address: string,
): Promise<AccountBalance | null> {
	try {
		const response = await fetch(
			`${HIRO_API_BASE_URL}/extended/v1/address/${address}/balances`,
			{ next: { revalidate: 60 } }, // Cache for 60 seconds
		);

		if (!response.ok) {
			throw new Error("Failed to fetch balance");
		}

		const data: AccountBalance = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching STX balance:", error);
		return null;
	}
}

export async function getTokenBalances(address: string): Promise<Token[]> {
	try {
		// Fetch token balances
		const balanceResponse = await fetch(
			`https://api.hiro.so/extended/v1/address/${address}/balances?unanchored=true`,
		);

		if (!balanceResponse.ok) {
			throw new Error("Failed to fetch token balances");
		}

		const data: AccountBalance = await balanceResponse.json();
		const tokens = Object.entries(data.fungible_tokens)
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			.filter(([_, value]) => BigInt(value.balance) > 0)
			.map(async ([tokenId, balance]) => {
				// Remove ::symbol from token ID
				const tokenPrincipal = tokenId.split("::")[0];

				// Fetch token metadata
				const metadataResponse = await fetch(
					`https://api.hiro.so/metadata/v1/ft/${tokenPrincipal}`,
				);

				if (!metadataResponse.ok) {
					console.log(`Failed to fetch metadata for ${tokenPrincipal}`);
				}

				const stxCityResponse = await getTokenMetadataFromSTXCity(
					tokenPrincipal as string,
				);

				const metadata: TokenMetadata = await metadataResponse.json();
				const normalizedBalance = Intl.NumberFormat("en-US").format(
					parseInt(balance.balance) / 1_000_000,
				);

				return {
					name: metadata.name,
					symbol: metadata.symbol,
					balance: normalizedBalance,
					worth: 0,
					image: metadata?.image_uri || "/default-token.png",
					stxcity: stxCityResponse,
				};
			});

		return Promise.all(tokens);
	} catch (error) {
		console.error("Error fetching token balances:", error);
		return [];
	}
}
