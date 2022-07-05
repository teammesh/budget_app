import { sort } from "ramda";

export const sortByDate = (arr: []) => {
	function diff(a, b) {
		return new Date(a.date).getTime() - new Date(b.date).getTime();
	}

	sort(diff, arr);
};
