import { sort } from "ramda";

export const sortByDate = (arr: any[]) => {
	function diff(a, b) {
		return new Date(a.date).getTime() - new Date(b.date).getTime();
	}

	return sort(diff, arr);
};

export const fetcher = (url, token) =>
	fetch(url, {
		method: "GET",
		headers: new Headers({ "Content-Type": "application/json", token }),
		credentials: "same-origin",
	}).then((res) => res.json());
