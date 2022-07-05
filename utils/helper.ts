import { sort } from "ramda";

export const sortByDate = (arr: any[]) => {
	function diff(a, b) {
		return new Date(a.date).getTime() - new Date(b.date).getTime();
	}

	return sort(diff, arr);
};
