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
            'ExpressionAttributeValues': {':type': 'comment'},
            'FilterExpression': 'blogId = :blogId',
            'ScanIndexForward': scanIndexForward
        } 
        
        if 'queryStringParameters' in event.keys():
            params = event['queryStringParameters']
            if 'blogId' in params.keys() and params['blogId'] is not None and params['blogId'] != "":
                query_params['ExpressionAttributeValues'][':blogId'] = params['blogId']
                
        response = dynamodb.query(**query_params)

        items = response['Items']
        # Sort the items by 'createdAt' in descending order (newest first)
        sorted_items = sorted(items, key=lambda x: x['createdAt'], reverse=True)
        
        # Return the sorted items as the response
        return {
            'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
            'body': json.dumps({
                'items': sorted_items,
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
