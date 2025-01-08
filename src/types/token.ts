export interface Token {
	name: string;
	symbol: string;
	balance: string;
	worth: number;
	image: string;
	stxcity?: StxCityTokenInfo | null;
}
export interface TokenMetadata {
	image_uri: string;
	name: string;
	symbol: string;
	decimals: number;
	image?: string;
}

export type StxCityTokenInfo = {
	id: number;
	token_contract: string;
	dex_contract: string;
	progress: number;
	name: string;
	tx_id: string;
	symbol: string;
	decimals: number;
	supply: number;
	logo_url: string;
	holders: number;
	deployed_at: string;
	stx_paid: number;
	description: string;
	xlink: string;
	homepage: string;
	status: string;
	target_AMM: string;
	chat_count: number;
	txs_count: number;
	trading_volume: number;
	target_stx: number;
};

export type StxCityTokenData = {
	ads_tokens?: StxCityTokenInfo[];
	bonding_curve?: StxCityTokenInfo[];
	normal: StxCityTokenInfo[];
};
