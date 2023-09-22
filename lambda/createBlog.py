import boto3
import json
import uuid
import datetime

tableName="sagas"
client = boto3.resource("dynamodb")
table = client.Table(tableName)
type = "blog"


def lambda_handler(event, context):
    print(event)
    createdAt = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()
    unique_id = str(uuid.uuid4())
    body = json.loads(event["body"])
    # body = event
    id  = type + "-" + unique_id + "-" + createdAt
    lowerUserTags = [t.lower() for t in body["userTags"]]
    lowerTags = [t.lower() for t in body["tags"]]
    lowerUserSagas = [t.lower() for t in body["userSagas"]]
    lowerSaga = body["saga"].lower()
    
    newSagas = []
    for saga in lowerUserSagas:
        tempSaga = saga['saga']
        tempUpdated = saga['updated']
        if saga['saga'] == lowerSaga and saga['updated'] == "":
            tempUpdated = createdAt
        newSagas.append({"saga": tempSaga, "updated": tempUpdated})

    response = table.put_item(
        TableName=tableName,
        Item={
            "id": id,
            "createdAt": createdAt,
            "type": type,
            "title": body["title"],
            "body": body["body"],
            "userId": body["userId"],
            "author": body["author"],
            "visible": True,
            "tags": lowerTags,
            "saga": lowerSaga,
        },
    )

    if len(body['userTags']) != 0:
        response = table.update_item(
            TableName=tableName,
            Key={
                'id': body["userId"],
                'createdAt': '2023-09-20T00:24:45+00:00'
            },
            UpdateExpression="SET tags = :newTags",
            ExpressionAttributeValues={
                ':newTags': lowerUserTags
            }
        )

    sagaResponse = table.update_item(
        TableName=tableName,
        Key={
            'id': body["userId"],
            'createdAt': '2023-09-20T00:24:45+00:00'
        },
        UpdateExpression="SET sagas = :newSagas",
        ExpressionAttributeValues={
            ':newSagas': newSagas
        }
    )
    
    responseBody = {
        "message": "Blog added with id: " + id,
    }

    response = {
        "statusCode": response["ResponseMetadata"]["HTTPStatusCode"],
        "body": json.dumps(responseBody),
    }

    return response
