import boto3
import json
from boto3.dynamodb.conditions import Key
import datetime

tableName = 'sagas'
datetime = datetime.datetime.now(datetime.timezone.utc)
defaultDate = datetime.strftime("%Y-%m-%dT%H:%M:%SZ")

query_params = {
    'TableName': tableName,
    'KeyConditionExpression': '',  # Initialize an empty condition
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

def lambda_handler(event, context):
    client = boto3.resource('dynamodb').Table(tableName)
    body2 = event
    print(body2)
    for param_key, attr_name in optional_params.items():
        if param_key in body2 and body2[param_key] is not None:
            if param_key == 'tags':
                # For array attributes, check if the value exists in the array
                query_params['KeyConditionExpression'] += f'contains(#{attr_name}, :{param_key}) AND '
            else:
                query_params['KeyConditionExpression'] += f'#{attr_name} = :{param_key} AND '
            query_params['ExpressionAttributeNames'][f'#{attr_name}'] = attr_name
            query_params['ExpressionAttributeValues'][f':{param_key}'] = body2[param_key]


    if 'createdAt' not in body2.__str__():
        query_params['KeyConditionExpression'] += f'#createdAt = :createdAt AND '
        query_params['ExpressionAttributeNames'][f'#createdAt'] = 'createdAt'
        query_params['ExpressionAttributeValues'][f':createdAt'] = '2023-09-05'

        
    if query_params['KeyConditionExpression'].endswith(' AND '):
        query_params['KeyConditionExpression'] = query_params['KeyConditionExpression'][:-5]
        
        
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