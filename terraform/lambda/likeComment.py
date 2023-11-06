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
    # body = json.loads(event["body"])
    body = event
    comment = body['comment']
    
    likes = comment['likes'] if comment['likes'] is not None else []
    
    likes.append(body['userId']) if body['like'] else likes.remove(body['userId'])

    response = table.update_item(
        Key={
            'id': comment['id'], #comment-128264c0-1cf0-4be9-8112-8797bab15f4a-2023-11-06T05:43:44+00:00
            'createdAt': comment['createdAt'] #2023-11-06T05:43:44+00:00
        },
        UpdateExpression="SET likes = :likes",
        ExpressionAttributeValues={
            ':likes': likes,
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
