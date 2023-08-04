export function formatDateArray(dateStr: string, l: number): string[] {
  const dateArray: string[] = [];
  const startDate = new Date(dateStr);

  for (let i = 0; i < l; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const formattedDate = `${addLeadingZero(
      currentDate.getDate()
    )} ${getMonthAbbreviation(currentDate.getMonth())}`;
    dateArray.push(formattedDate);
  }

  return dateArray;
}

function addLeadingZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function getMonthAbbreviation(month: number): string {
  const monthsAbbreviation = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthsAbbreviation[month];
}


export function waitSeconds(seconds:number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}