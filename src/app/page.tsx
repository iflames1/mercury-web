import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Login from "./_components/login";
import { getWalletCookie } from "./actions";
import { redirect } from "next/navigation";

export default async function Home() {
	const walletData = await getWalletCookie();

	if (walletData?.walletAddress) {
		redirect(`/${walletData?.walletAddress}`);
	}

	return (
		<div className="min-h-screen bg-background p-6">
			<Card className="max-w-2xl mx-auto">
				<CardHeader>
					<CardTitle className="text-3xl font-bold">
						Welcome to Mercury
					</CardTitle>
				</CardHeader>

				<CardContent className="space-y-6">
					<p className="text-lg leading-7">
						Mercury is the fastest trading bot on the Stacks chain. Execute
						trades instantly, set up automations like Limit Orders, DCA,
						Copy-trading and Sniping with unmatched speed and reliability.
					</p>
					<Login />
				</CardContent>
			</Card>
		</div>
	);
}
