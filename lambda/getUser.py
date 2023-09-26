import boto3
import json
from boto3.dynamodb.conditions import Key

tableName = 'sagas'
dynamodb = boto3.resource('dynamodb').Table(tableName)

def lambda_handler(event, context):
    
    id = None
    if event['queryStringParameters'] is not None and event['queryStringParameters']['id'] is not None:
        id = event['queryStringParameters']['id']

    if id:
        response = dynamodb.query(
            KeyConditionExpression=Key('id').eq(id)
        )
    print(response)
    
    return {
        'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
        'body': json.dumps(response['Items'])
    }
