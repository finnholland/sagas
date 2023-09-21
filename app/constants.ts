const userPool = {
  "REGION": "ap-southeast-2",
  "USER_POOL_ID": "ap-southeast-2_CVaA2YJhS",
  "USER_POOL_APP_CLIENT_ID": "3gji2smv1udmuraqqvvuoipr5j"
}
const API = 'https://6ybnxhezk9.execute-api.ap-southeast-2.amazonaws.com/default'
const S3_URL = 'https://sagas.s3.ap-southeast-2.amazonaws.com/'

const DATE_TYPE = {
  BLOG: 'BLOG',
  SAGA: 'SAGA',
}
export { API, userPool, DATE_TYPE, S3_URL }