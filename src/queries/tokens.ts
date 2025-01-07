import { STX_CITY_API_BASE_URL } from "@/lib/constants";
import { StxCityTokenData, StxCityTokenInfo } from "@/types/token";

export async function getTokenMetadataFromSTXCity(
	contractID: string,
): Promise<StxCityTokenInfo | null> {
	try {
		if (!contractID) {
			throw new Error("YOU MUST PASS CONTRACT ID");
		}
		console.log("starting to fetch");
		const url = `${STX_CITY_API_BASE_URL}searchTokens?token_contract=${contractID}`;
		// const url = `${API_BASE_URL}searchTokens/${contractID}`;
		const res = await fetch(url);
		const data: StxCityTokenData = await res.json();
		const token = data?.bonding_curve[0];

		console.log(data, url, "hereee");
		return token;
	} catch (err) {
		console.error(err);
		return null;
	}
}
