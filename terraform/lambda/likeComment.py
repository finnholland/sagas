import boto3
import json
import uuid
import datetime
import os
tableName=os.environ.get("tableName")
client = boto3.resource("dynamodb")
table = client.Table(tableName)
type = "comment"


def lambda_handler(event, context):
    print(event)
    body = json.loads(event["body"])
    # body = event  

    response = table.update_item(
        Key={
            'id': body['commentId'], #comment-128264c0-1cf0-4be9-8112-8797bab15f4a-2023-11-06T05:43:44+00:00
            'createdAt': body['createdAt'] #2023-11-06T05:43:44+00:00
        },
        UpdateExpression="SET likes = list_append(likes, :i)",
        ExpressionAttributeValues={
            ':i': body['likes'],
        },
        ReturnValues="UPDATED_NEW"
    )
    
    responseBody = {
        "message": "added a like",
    }

    response = {
        "statusCode": response["ResponseMetadata"]["HTTPStatusCode"],
        "body": json.dumps(responseBody),
    }

    return response
