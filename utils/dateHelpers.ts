// utils/dateHelpers.ts
export const paginateDate = (date: string): string => {
	const newDate = new Date(date.replaceAll("-", "/"));
	const month = newDate.getMonth() - 6;

	if (month < 0) {
		newDate.setFullYear(newDate.getFullYear() - 1);
		newDate.setMonth(11 - Math.abs(month));
	} else {
		newDate.setMonth(month);
	}

	newDate.setHours(0, 0, 0, 0);
	return getFormattedDate(newDate);
};

export const getFormattedDate = (date: Date): string => {
	return date
		.toLocaleDateString("en-ZA", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		})
		.replaceAll("/", "-");
};

export const getDateRangeFromNow = (months = 6): {
	startDate: string,
	endDate: string
} => {
	const endDate = new Date();
	const startDate = new Date();

	startDate.setMonth(endDate.getMonth() - months);

	return {
		startDate: getFormattedDate(startDate),
		endDate: getFormattedDate(endDate),
	};
};

export const isDateInRange = (
	date: string,
	startDate: string,
	endDate: string,
): boolean => {
	const checkDate = new Date(date);
	const start = new Date(startDate);
	const end = new Date(endDate);

	return checkDate >= start && checkDate <= end;
};
