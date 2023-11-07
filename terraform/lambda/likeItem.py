import boto3
import json
import os
tableName=os.environ.get("tableName")
client = boto3.resource("dynamodb")
table = client.Table(tableName)
type = "comment"


def lambda_handler(event, context):
    print(event)
    body = json.loads(event["body"])
    # body = event
    
    likes = body['likes'] if body['likes'] is not None else []
    
    likes.append(body['userId']) if body['like'] else likes.remove(body['userId'])

    response = table.update_item(
        Key={
            'id': body['id'],
            'createdAt': body['createdAt']
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
