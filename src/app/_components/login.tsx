"use client";
import React, { useState } from "react";
import TermsCondition from "./terms-and-conditions";
import GenerateWallet from "./generate-wallet";
import ImportWallet from "./import-wallet";

export default function Login() {
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [isConfirmed, setIsConfirmed] = useState(false);

	if (isConfirmed) {
		return (
			<div className="grid gap-4 sm:grid-cols-2">
				<GenerateWallet />
				<ImportWallet />
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
