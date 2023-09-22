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

    for param_key, param_value in filters.items():

        if param_key == 'tags':

            # For the 'tags' attribute, parse it as a JSON string and search within it
            if isinstance(param_value, list) and all(isinstance(item, dict) for item in param_value):
                for tag_dict in param_value:

                    for tag_key, tag_value in tag_dict.items():

                        # For each tag key-value pair, add a contains condition
                        query_params['FilterExpression'] += f'contains(tags, :{tag_key}) AND '
                        query_params['ExpressionAttributeValues'][f':{tag_key}'] = tag_value

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
