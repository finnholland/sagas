import boto3
import json
from boto3.dynamodb.conditions import Key
import os
tableName=os.environ.get("tableName")
indexName="user-index"
dynamodb = boto3.resource('dynamodb').Table(tableName)

def lambda_handler(event, context):
    
    id = '0a6d1f96-70ca-407b-a99c-569bb425faca'
    self = False

    if 'queryStringParameters' in event.keys():
        params = event['queryStringParameters']
        if 'id' in params.keys() and params['id'] is not None and params['id'] != "":
            id = event['queryStringParameters']['id']
        if 'self' in params.keys() and params['self'] is not None:
            self = event['queryStringParameters']['self']
    if id:
        key = {
            'id': id
        }
        response = dynamodb.query(
            TableName=tableName,
            IndexName=indexName,
            KeyConditionExpression=Key('id').eq(id)
        )
    print(response)
    
    if len(response['Items']) > 0:
        user = response['Items'][0]
    
        if not self:
            user.pop('draft', None)
        
        return {
            'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
            'body': json.dumps(user)
        }
    
    return {
        'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
        'body': 'User not found'
    }