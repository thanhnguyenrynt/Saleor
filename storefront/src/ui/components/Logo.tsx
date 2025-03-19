"use client";

import { usePathname } from "next/navigation";
import { LinkWithChannel } from "../atoms/LinkWithChannel";

// const companyName = "ACME";

export const Logo = () => {
	const pathname = usePathname();

	if (pathname === "/") {
		return (
			<h1 className="flex items-center font-bold" aria-label="homepage">
				<img src="https://d1dif2dtw17xb9.cloudfront.net/images/logo-text.svg" alt="Logo" />
			</h1>
		);
	}
	return (
		<div className="flex items-center font-bold">
			<LinkWithChannel aria-label="homepage" href="/">
				<img src="https://d1dif2dtw17xb9.cloudfront.net/images/logo-text.svg" alt="Logo" className="h-8" />
			</LinkWithChannel>
		</div>
	);
};
