export const getUnixTime = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};
