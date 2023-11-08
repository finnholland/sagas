import boto3
import json
import uuid
import datetime
import os
from better_profanity.better_profanity import profanity
tableName=os.environ.get("tableName")
client = boto3.resource("dynamodb")
table = client.Table(tableName)
type = "comment"


def lambda_handler(event, context):
    profanity.load_censor_words()
    print(event)
    createdAt = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()
    unique_id = str(uuid.uuid4())
    body = json.loads(event["body"])
    # body = event
    id  = type + "-" + unique_id + "-" + createdAt
    censored_body = profanity.censor(body["body"])
    censored_author = profanity.censor(body["author"])
    
    response = table.put_item(
        TableName=tableName,
        Item={
            "id": id,
            "blogId": body["blogId"],
            "createdAt": createdAt,
            "type": type,
            "body": censored_body,
            "userId": body["userId"],
            "image": body["image"],
            "author": censored_author,
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
