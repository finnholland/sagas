import json
import boto3

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    
    try:
        last_evaluated_key = event.get('last_evaluated_key')

        # Scan the table for items where 'createdAt' exists, starting from the last evaluated key
        if last_evaluated_key is not None:
            response = dynamodb.scan(
                TableName='sagas',
                FilterExpression='attribute_exists(createdAt)',
                Limit=5,  # Limit the result to 5 records per page
                ExclusiveStartKey= last_evaluated_key  # Use the last evaluated key for pagination
            )
        else:
            response = dynamodb.scan(
                TableName='sagas',
                FilterExpression='attribute_exists(createdAt)',
                Limit=5,  # Limit the result to 5 records per page
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
