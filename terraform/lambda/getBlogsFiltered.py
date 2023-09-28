import boto3
import json
from boto3.dynamodb.conditions import Key

tableName = 'sagas'
indexName = 'type-createdAt-index'
scanIndexForward=False
client = boto3.resource('dynamodb').Table(tableName)
def lambda_handler(event, context):
    query_params = {
        'TableName': tableName,
        'IndexName': indexName,
        'KeyConditionExpression': '',
        'FilterExpression': '',
        'ExpressionAttributeNames': {},
        'ExpressionAttributeValues': {},
        'ScanIndexForward':scanIndexForward,
    }
    
    filters = None
    if 'queryStringParameters' in event.keys():
        params = event['queryStringParameters']
        if 'last_evaluated_filter_key' in params.keys() and params['last_evaluated_filter_key'] is not None and params['last_evaluated_filter_key'] != "":
            query_params['ExclusiveStartKey'] = json.loads(params['last_evaluated_filter_key'])
        if 'filters' in params.keys() and params['filters'] is not None and params['filters'] != "":
            filters = json.loads(params['filters'])
    
    if 'id' in filters.keys():
        filters['id'] = filters['id'].replace('=', '+')

    
    query_params['KeyConditionExpression'] += f'#type = :type'
    query_params['ExpressionAttributeNames'][f'#type'] = 'type'
    query_params['ExpressionAttributeValues'][f':type'] = 'blog'

    for param_key, param_value in filters.items():

        if param_key == 'tags':
            # For the 'tags' attribute, parse it as a JSON string and search within it
            for tag_value in param_value:

                # For each tag key-value pair, add a contains condition
                query_params['FilterExpression'] += f'contains(tags, :{tag_value}) AND '
                query_params['ExpressionAttributeValues'][f':{tag_value}'] = tag_value
        elif param_key != 'last_evaluated_filter_key':
            # For other attributes, simply filter by equality
            query_params['FilterExpression'] += f'{param_key} = :{param_key} AND '
            query_params['ExpressionAttributeValues'][f':{param_key}'] = param_value

    if query_params['FilterExpression'].endswith(' AND '):
        query_params['FilterExpression'] = query_params['FilterExpression'][:-5]
    

    response = client.query(**query_params)
    print(response)
    last_evaluated_filter_key = response.get('LastEvaluatedKey')
    
    responseBody = {
        'message': 'Success',
        'items': response['Items'],
        'last_evaluated_filter_key': last_evaluated_filter_key
    }

    response = {
        'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
        'body': json.dumps(responseBody)
    }

    return response
