import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsConditionProps {
	termsAccepted: boolean;
	setTermsAccepted: (value: boolean) => void;
	setIsConfirmed: (value: boolean) => void;
}

export default function TermsCondition({
	termsAccepted,
	setTermsAccepted,
	setIsConfirmed,
}: TermsConditionProps) {
	return (
		<>
			<p className="text-muted-foreground">
				By continuing, you&apos;ll create a crypto wallet that connects with
				Mercury to enable instant swaps and real-time data.
			</p>
			<div className="flex items-start space-x-2">
				<Checkbox
					id="terms"
					checked={termsAccepted}
					onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
				/>
				<label
					htmlFor="terms"
					className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					I accept the{" "}
					<Link href="#" className="text-primary hover:underline">
						Terms of Use
					</Link>{" "}
					and{" "}
					<Link href="#" className="text-primary hover:underline">
						Privacy Policy
					</Link>
				</label>
			</div>
			<Button
				disabled={!termsAccepted}
				className="w-full"
				size="lg"
				onClick={() => setIsConfirmed(true)}
			>
				Continue
			</Button>
		</>
	);
}
