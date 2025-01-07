export interface STXBalanceResponse {
	balance: string;
	total_sent: string;
	total_received: string;
	total_fees_sent: string;
	total_miner_rewards_received: string;
	lock_tx_id: string;
	locked: string;
	lock_height: number;
	burnchain_lock_height: number;
	burnchain_unlock_height: number;
}
