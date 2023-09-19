import boto3
import json
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.types import TypeDeserializer

dynamodb = boto3.client('dynamodb')
tableName = 'sagas'

def lambda_handler(event, context):
    
    id = None#event['id']
    if event['queryStringParameters'] is not None and event['queryStringParameters']['id'] is not None:
        id = event['queryStringParameters']['id']
            
    if id:
        response = dynamodb.query(
            TableName=tableName,
            KeyConditionExpression='#id = :id',
            ExpressionAttributeNames={'#id': 'id'},
            ExpressionAttributeValues={':id': {'S': id}},
        )
        
        print (response)
    
    if 'Items' in response:
        item = response['Items'][0]
        # Convert DynamoDB types to Python types if needed (e.g., JSON serialization)
        item_json = json.dumps(item, indent=2)
        return {
            'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
            'body': item_json
        }
    else:
        return {
            'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
            'body': 'Item not found'
        }


##### INVESTIGATE USING getItem ##### This may need a new table for best practice! ##### Requires createdAt
import boto3
import json
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
tableName = 'sagas'
table = dynamodb.Table(tableName)

def lambda_handler(event, context):
    
    id = event['id']
    createdAt = ''
    if event['queryStringParameters'] is not None and event['queryStringParameters']['id'] is not None:
        id = event['queryStringParameters']['id']
            
    if id:
        response = table.get_item(
            Key={'id': id, 'createdAt': createdAt}
        )
        
        print (response)
    
    if 'Items' in response:
        item = response['Items']
        # Convert DynamoDB types to Python types if needed (e.g., JSON serialization)
        item_json = json.dumps(item, indent=2)
        return {
            'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
            'body': item_json
        }
    else:
        return {
            'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
            'body': 'Item not found'
        }
