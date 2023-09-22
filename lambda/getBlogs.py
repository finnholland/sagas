import boto3
import json
from boto3.dynamodb.conditions import Key

tableName = 'sagas'
indexName = 'type-createdAt-index'
client = boto3.resource('dynamodb').Table(tableName)
def lambda_handler(event, context):
    query_params = {
        'TableName': tableName,
        'IndexName': indexName,
        'KeyConditionExpression': '',
        'FilterExpression': '',
        'ExpressionAttributeNames': {},
        'ExpressionAttributeValues': {}
    }

    query_params['KeyConditionExpression'] += f'#type = :type'
    query_params['ExpressionAttributeNames'][f'#type'] = 'type'
    query_params['ExpressionAttributeValues'][f':type'] = 'blog'

    filters = None
    if event['queryStringParameters'] is not None and event['queryStringParameters']['filters'] is not None:
        filters = json.loads(event['queryStringParameters']['filters'])
    else :
        return {
            'statusCode': 200,
            'body': 'no filters set'
        }

    for param_key, param_value in filters.items():
        if param_key == 'tags':
            # For the 'tags' attribute, parse it as a JSON string and search within it
            query_params['FilterExpression'] += 'contains(tags, :tag) AND '
            query_params['ExpressionAttributeValues'][f':tag'] = param_value
        else:
            # For other attributes, simply filter by equality
            query_params['FilterExpression'] += f'{param_key} = :{param_key} AND '
            query_params['ExpressionAttributeValues'][f':{param_key}'] = param_value

    if query_params['FilterExpression'].endswith(' AND '):
        query_params['FilterExpression'] = query_params['FilterExpression'][:-5]

    response = client.query(**query_params)

    responseBody = {
        'message': 'Success',
        'query': query_params,
        'items': response['Items']
    }

    response = {
        'statusCode': 200,
        'body': json.dumps(responseBody)
    }

    return response
