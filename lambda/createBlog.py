import boto3
import json
import uuid
import datetime

client = boto3.resource('dynamodb').Table('sagas')
type = 'blog'

def lambda_handler(event, context):
    createdAt = datetime.datetime.now().isoformat()
    dateId = datetime.datetime.now().replace(microsecond=0).isoformat()
    unique_id = str(uuid.uuid4())
    body = json.loads(event['body'])

    response = client.put_item(
    TableName='sagas',
        Item={
            'id': type+'-'+unique_id+'-'+dateId,
            'createdAt': createdAt,
            'type': type,
            'title': body['title'],
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