import { Agent } from "undici";
import fs from "fs";

export const tellerApiRequest = async (endpoint: string, options: any) => {
	const response =await fetch(`https://api.teller.io/${endpoint}`, {
		// @ts-ignore
		dispatcher: new Agent({
			connect: {
				cert: fs.readFileSync(process.env.TELLER_CLIENT_CERT_PATH!),
				key: fs.readFileSync(process.env.TELLER_CLIENT_KEY_PATH!),
			},
		}),
		method: options.method,
		headers: {
			"Authorization": `Basic ${Buffer.from(options.access_token + ":").toString("base64")}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorBody = await response.text();
		console.error(`API Error: ${response.status} - ${errorBody}`);
		throw new Error(`Teller API request failed: ${response.statusText}`);
	}

	return response.json();
};
