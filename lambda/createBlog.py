import boto3
import json
import uuid
import datetime

def lambda_handler(event, context):
    createdAt = datetime.datetime.now().isoformat()
    unique_id = str(uuid.uuid4())
    body = json.loads(event['body'])
    client = boto3.resource('dynamodb').Table('sagas')

    response = client.put_item(
    TableName='sagas',
        Item={
            'id': unique_id,
            'title': body['title'],
            'createdAt': createdAt,
            'body': body['body'],
            'author': body['author'],
            'visible': body['visible'],
            'tags': body['tags'],
            'saga': body['saga']
        }
    )
    
    responseBody = {
        'message': 'Blog ' + body['title'] + ' added with id: ' + unique_id,
        'input': event
    };

    response = {
        'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
        'body': json.dumps(responseBody)
    };

    return response;