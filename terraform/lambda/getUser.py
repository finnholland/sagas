import boto3
import json
from boto3.dynamodb.conditions import Key
import os
tableName=os.environ.get("tableName")
dynamodb = boto3.resource('dynamodb').Table(tableName)

def lambda_handler(event, context):
    
    id = '0a6d1f96-70ca-407b-a99c-569bb425faca'

    if 'queryStringParameters' in event.keys():
        params = event['queryStringParameters']
        if 'id' in params.keys() and params['id'] is not None and params['id'] != "":
            id = event['queryStringParameters']['id']

    if id:
        key = {
            'id': id,
            'createdAt': "null"
        }
        response = dynamodb.get_item(
            Key=key
        )
    print(response)
    
    return {
        'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
        'body': json.dumps(response['Item'])
    }
