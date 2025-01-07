import { HIRO_API_BASE_URL } from "@/lib/constants";
import { STXBalanceResponse } from "@/types/balance";

export async function getSTXBalance(address: string): Promise<number> {
	try {
		const response = await fetch(
			`${HIRO_API_BASE_URL}/extended/v1/address/${address}/stx?unanchored=true`,
			{ next: { revalidate: 60 } }, // Cache for 60 seconds
		);

		if (!response.ok) {
			throw new Error("Failed to fetch balance");
		}

		const data: STXBalanceResponse = await response.json();
		return parseInt(data.balance) / 1_000_000;
	} catch (error) {
		console.error("Error fetching STX balance:", error);
		return 0;
	}
}
