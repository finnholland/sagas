import json
import boto3
from boto3.dynamodb.types import TypeDeserializer
import os
tableName=os.environ.get("tableName")
dynamodb = boto3.resource('dynamodb').Table(tableName)
indexName = 'type-createdAt-index'
deserializer = TypeDeserializer()

def lambda_handler(event, context):
    scanIndexForward = False
    try:
                       
        query_params = {
            'TableName': tableName,
            'IndexName': indexName,
            'KeyConditionExpression': '#type = :type',
            'ExpressionAttributeNames': {'#type': 'type'},
            'ExpressionAttributeValues': {':type': 'blog'},
            'Limit': 5,
            'ScanIndexForward': scanIndexForward
        } 
        
        if 'queryStringParameters' in event.keys():
            params = event['queryStringParameters']
            if 'last_evaluated_key' in params.keys() and params['last_evaluated_key'] is not None and params['last_evaluated_key'] != "":
                query_params['ExclusiveStartKey'] = json.loads(params['last_evaluated_key'])
                
        response = dynamodb.query(**query_params)

        items = response['Items']
        last_evaluated_key = response.get('LastEvaluatedKey')
        # Sort the items by 'createdAt' in descending order (newest first)
        sorted_items = sorted(items, key=lambda x: x['createdAt'], reverse=True)

        # Return the sorted items as the response
        return {
            'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
            'body': json.dumps({
                'items': sorted_items,
                'last_evaluated_key': last_evaluated_key
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
