export function toLocalDateTimeInputValue(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');

	const yyyy = date.getFullYear();
	const mm = pad(date.getMonth() + 1);
	const dd = pad(date.getDate());
	const hh = pad(date.getHours());
	const mi = pad(date.getMinutes());

	return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function getTodayMorningRange() {
	const start = new Date();
	start.setHours(9, 0, 0, 0);

	const end = new Date(start);
	end.setHours(12, 0, 0, 0);

	return {
		startAt: toLocalDateTimeInputValue(start),
		endAt: toLocalDateTimeInputValue(end)
	};
}

export function getTomorrowAfternoonRange() {
	const start = new Date();
	start.setDate(start.getDate() + 1);
	start.setHours(13, 0, 0, 0);

	const end = new Date(start);
	end.setHours(17, 0, 0, 0);

	return {
		startAt: toLocalDateTimeInputValue(start),
		endAt: toLocalDateTimeInputValue(end)
	};
}

export function getNextWeekMorningRange() {
	const start = new Date();
	start.setDate(start.getDate() + 7);
	start.setHours(9, 0, 0, 0);

	const end = new Date(start);
	end.setHours(12, 0, 0, 0);

	return {
		startAt: toLocalDateTimeInputValue(start),
		endAt: toLocalDateTimeInputValue(end)
	};
}

export function addHoursToLocalDateTimeInput(value: string, hours: number): string {
	const date = new Date(value);
	date.setHours(date.getHours() + hours);
	return toLocalDateTimeInputValue(date);
}
