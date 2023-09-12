import moment from "moment";

export const getBlogAge = (createdAt: string) => {
  const now = moment(new Date()).utcOffset('+0000'); //todays date
  const end = moment(createdAt);
  const MINUTE = Math.round(moment.duration(now.diff(end)).asMinutes());
  const HOUR = Math.round(moment.duration(now.diff(end)).asHours());
  const DAY = Math.round(moment.duration(now.diff(end)).asDays());
  const WEEK = Math.round(moment.duration(now.diff(end)).asWeeks());
  const MONTH = Math.round(moment.duration(now.diff(end)).asMonths());
  const YEAR = Math.round(moment.duration(now.diff(end)).asYears());


  let ageString = ''
  if (YEAR > 1) {
    ageString = YEAR.toString() + ' years ago'
  } else if (MONTH > 1) {
    ageString = MONTH.toString() + ' months ago';
  } else if (WEEK > 1) {
    ageString = WEEK.toString() + ' weeks ago'; // minutes -> hours
  } else if (DAY > 1) {
    ageString = DAY.toString() + ' days ago'; // minutes -> hours -> days
  } else if (HOUR > 1) {
    ageString = HOUR.toString() + ' hours ago';
  } else if (MINUTE > 1) {
    ageString = MINUTE.toString() + ' minutes ago'
  } else {
    ageString = 'just now'
  }
  console.log(end, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR)
  return moment(createdAt).format("YYYY/MM/DD") + ' - ' +ageString;
}