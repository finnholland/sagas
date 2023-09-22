import moment from "moment";
import { DATE_TYPE, S3_URL } from "./constants";
import AWS from 'aws-sdk';
import { ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "./secrets";

export const getDateAge = (createdAt: string, type: string) => {
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
    ageString = YEAR.toString() + ( YEAR >= 2 ? ' years' : ' year') + ' ago'
  } else if (MONTH > 1) {
    ageString = MONTH.toString() + (MONTH >= 2 ? ' months' : ' month') + ' ago';
  } else if (WEEK > 1) {
    ageString = WEEK.toString() + (WEEK >= 2 ? ' weeks' : ' week') + ' ago'; // minutes -> hours
  } else if (DAY > 1) {
    ageString = DAY.toString() + (DAY >= 2 ? ' days' : ' day') + ' ago'; // minutes -> hours -> days
  } else if (HOUR > 1) {
    ageString = HOUR.toString() + (HOUR >= 2 ? ' hours' : ' hour') + ' ago';
  } else if (MINUTE > 1) {
    ageString = MINUTE.toString() + (MINUTE >= 2 ? ' minutes' : ' minute') + ' ago'
  } else {
    ageString = 'just now'
  }

  if (type === DATE_TYPE.SAGA) {
    return ageString;
  } else {
    return moment(createdAt).format("YYYY/MM/DD") + ' - ' + ageString;
  }
}

export const uploadFile = async (name: string, body: File) => {
  const S3_BUCKET = "sagas";
  const REGION = "ap-southeast-2";

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY || ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_SECRET_KEY || SECRET_ACCESS_KEY,
  });
  const s3 = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
  });

  const params = {
    Bucket: S3_BUCKET,
    Key: name,
    Body: body,
    ContentType: 'image/jpeg'
  };

  var upload = s3
    .putObject(params)
    .on("httpUploadProgress", (evt) => {
      console.log(
        `Uploading ${((evt.loaded * 100) / evt.total)} %`
      );
    })
    .promise();

  await upload.then((err) => {
    console.log(err);
  });

  return S3_URL + name
};

export const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mimeGroup = arr[0].match(/data:(.*?);/);
  let mime = '';
  if (mimeGroup && mimeGroup[1])
    mime = mimeGroup[1];
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export const isEmpty = (str: string): boolean => {
  return str.trim() === "";
}