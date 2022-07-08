import { sort } from "ramda";

export const sortByDate = (arr: any[]) => {
	function diff(a: any, b: any) {
		return new Date(a.date).getTime() - new Date(b.date).getTime();
	}

	return sort(diff, arr);
};

export const fetcher = (url: string, token: string) =>
	fetch(url, {
		method: "GET",
		headers: new Headers({ "Content-Type": "application/json", token }),
		credentials: "same-origin",
	}).then((res) => res.json());
