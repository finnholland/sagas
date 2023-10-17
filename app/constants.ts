const userPool = {
  "REGION": "ap-southeast-2",
  "USER_POOL_ID": "ap-southeast-2_CVaA2YJhS",
  "USER_POOL_APP_CLIENT_ID": "3gji2smv1udmuraqqvvuoipr5j"
}
const ENV = process.env.NEXT_PUBLIC_ENV || 'prod';
const API = `https://sagas${ENV === 'prod' ? '' : ENV}.api.finnholland.dev`
const S3_URL = `https://sagas.s3.ap-southeast-2.amazonaws.com/${ENV}/`
const S3_BUCKET = `sagas`
const REGION = "ap-southeast-2";

const DATE_TYPE = {
  BLOG: 'BLOG',
  SAGA: 'SAGA',
  EDIT: 'EDIT',
}
export { API, userPool, DATE_TYPE, S3_URL, ENV, S3_BUCKET, REGION }