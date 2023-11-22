import json

def lambda_handler(event, context):
    # TODO implement
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Headers": "",
            "Access-Control-Allow-Origin": "https://sagas.finnholland.dev",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        }
    }
