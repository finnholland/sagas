import boto3
import json
from boto3.dynamodb.conditions import Key
import datetime

tableName = 'sagas'
indexName = 'type-createdAt-index'

def lambda_handler(event, context):
    query_params = {
        'TableName': tableName,
        'IndexName': indexName,
        'KeyConditionExpression': '',
        'FilterExpression': '',
        'ExpressionAttributeNames': {},
        'ExpressionAttributeValues': {}
    }
    
    optional_params = {
        "title": "title",
        "body": "body",
        "createdAt": "createdAt",
        "author": "author",
        "visible": "visible",
        "tags": [],
        "saga": "saga"
    }
    
    createdAt = datetime.datetime.now().isoformat()
    client = boto3.resource('dynamodb').Table(tableName)
    body = json.loads(event['body'])
    
    query_params['KeyConditionExpression'] += f'#type = :type'
    query_params['ExpressionAttributeNames'][f'#type'] = 'type'
    query_params['ExpressionAttributeValues'][f':type'] = 'blog'
    for param_key, attr_name in optional_params.items():
        if param_key in body and body[param_key] is not None:
            if param_key == 'tags':
                # For array attributes, check if the value exists in the array
                query_params['FilterExpression'] += f'contains(#{attr_name}, :{param_key}) AND '
            else:
                query_params['FilterExpression'] += f'#{attr_name} = :{param_key} AND '
            query_params['ExpressionAttributeNames'][f'#{attr_name}'] = attr_name
            query_params['ExpressionAttributeValues'][f':{param_key}'] = body[param_key]
        
    if query_params['FilterExpression'].endswith(' AND '):
        query_params['FilterExpression'] = query_params['FilterExpression'][:-5]
        
    response = client.query(**query_params)
    
    responseBody = {
        'message': 'retrieved ',
        'Blogs': response['Items']
    };

    response = {
        'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
        'body': json.dumps(responseBody)
    };

    return response;