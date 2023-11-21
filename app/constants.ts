import { Options } from "rehype-external-links";

const userPool = {
  "REGION": "ap-southeast-2",
  "USER_POOL_ID": "ap-southeast-2_CVaA2YJhS",
  "USER_POOL_APP_CLIENT_ID": "3gji2smv1udmuraqqvvuoipr5j"
}
const ENV = process.env.NEXT_PUBLIC_ENV || 'prod';
const API = `https://sagas${ENV === 'prod' ? '' : ENV}.api.finnholland.dev`
const S3_URL = `https://sagas.s3.ap-southeast-2.amazonaws.com/${ENV}/`
const DEFAULT_PROFILES_URL = `https://sagas.s3.ap-southeast-2.amazonaws.com/default_profiles/`
const S3_BUCKET = `sagas`
const REGION = "ap-southeast-2";

const profileImages = [
  'cow.png', 'chicken.png', 'tiger.png', 'cat.png', 'bear.png', 'polarbear.png', 'pig.png', 'dog.png', 'rabbit.png', 'koala.png', 'frog.png', 'hamster.png'
]

const OPTIONS: Options = {
  target: '_blank',
  rel: ['nofollow', 'noopener', 'noreferrer'],
};

const DATE_TYPE = {
  BLOG: 'BLOG',
  SAGA: 'SAGA',
  EDIT: 'EDIT',
}
export { API, userPool, DATE_TYPE, S3_URL, ENV, S3_BUCKET, REGION, DEFAULT_PROFILES_URL, profileImages, OPTIONS }