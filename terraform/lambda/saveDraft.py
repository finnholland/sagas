import boto3
import json
import os
tableName=os.environ.get("tableName")
indexName="user-index"
client = boto3.resource("dynamodb")
table = client.Table(tableName)

def lambda_handler(event, context):
    body = json.loads(event["body"])
    body.pop('jwt', None)
    response = table.put_item(
        TableName=tableName,   
        Item=body
    )

    responseBody = {
        "message": "successfully updated draft",
    }
    return {
        "statusCode": response["ResponseMetadata"]["HTTPStatusCode"],
        "body": json.dumps(responseBody),
    }
