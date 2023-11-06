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
    createdAt = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()
    unique_id = str(uuid.uuid4())
    body = json.loads(event["body"])
    # body = event
    id  = type + "-" + unique_id + "-" + createdAt    

    response = table.put_item(
        TableName=tableName,
        Item={
            "id": id,
            "blogId": body["blogId"],
            "createdAt": createdAt,
            "type": type,
            "body": body["body"],
            "userId": body["userId"],
            "author": body["author"],
            "likes": []
        },
    )
    
    responseBody = {
        "message": "Comment added with id: " + id + " on blog " + body["blogId"],
    }

    response = {
        "statusCode": response["ResponseMetadata"]["HTTPStatusCode"],
        "body": json.dumps(responseBody),
    }

    return response
