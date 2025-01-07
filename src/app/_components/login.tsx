"use client";
import React, { useState } from "react";
import TermsCondition from "./terms-and-conditions";
import { Button } from "@/components/ui/button";
import GenerateWallet from "./generate-wallet";

export default function Login() {
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [isConfirmed, setIsConfirmed] = useState(false);

	if (isConfirmed) {
		return (
			<div className="grid gap-4 sm:grid-cols-2">
				<GenerateWallet />
				<Button variant={"secondary"}>Import Wallet</Button>
			</div>
		);
	}

	return (
		<TermsCondition
			termsAccepted={termsAccepted}
			setTermsAccepted={setTermsAccepted}
			setIsConfirmed={setIsConfirmed}
		/>
	);
}
