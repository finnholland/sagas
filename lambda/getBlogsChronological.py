import json
import boto3

dynamodb = boto3.client('dynamodb')
tableName = 'sagas'
indexName = 'type-createdAt-index'

def lambda_handler(event, context):
    scanIndexForward = False
    try:
        last_evaluated_key = None
        if event['queryStringParameters'] is not None and event['queryStringParameters']['last_evaluated_key'] is not None:
            last_evaluated_key = json.loads(event['queryStringParameters']['last_evaluated_key'])
        
        if last_evaluated_key:
            response = dynamodb.query(
                TableName=tableName,
                IndexName=indexName,
                KeyConditionExpression='#type = :type',
                ExpressionAttributeNames={'#type': 'type'},
                ExpressionAttributeValues={':type': {'S': 'blog'}},
                Limit=5,
                ExclusiveStartKey=last_evaluated_key,
                ScanIndexForward=scanIndexForward
            )
        else:
            response = dynamodb.query(
                TableName=tableName,
                IndexName=indexName,
                KeyConditionExpression='#type = :type',
                ExpressionAttributeNames={'#type': 'type'},
                ExpressionAttributeValues={':type': {'S': 'blog'}},
                Limit=5,  # Limit the result to 5 records per page
                ScanIndexForward=scanIndexForward
            )

        items = response['Items']
        last_evaluated_key = response.get('LastEvaluatedKey')
        # Sort the items by 'createdAt' in descending order (newest first)
        sorted_items = sorted(items, key=lambda x: x['createdAt']['S'], reverse=True)

        # Return the sorted items as the response
        return {
            'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
            'body': json.dumps({
                'items': items,
                'last_evaluated_key': last_evaluated_key
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
