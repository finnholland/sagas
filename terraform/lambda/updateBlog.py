import json
import boto3
import os

tableName=os.environ.get("tableName")
client = boto3.resource("dynamodb").Table(tableName)
type = "blog"

def lambda_handler(event, context):
    body = json.loads(event["body"])
    # TODO implement
    updating = False
    update_expression = "SET "
    expression_attribute_values = {}
    key = {
        "id": body['id'],
        'createdAt': body['createdAt']
    }
    
    if 'body' in body.keys():
        expression_attribute_values[':body'] = body['body']
        update_expression += 'body = :body'
        updating = True
    if 'title' in body.keys():
        expression_attribute_values[':title'] = body['title']
        update_expression += ', ' if 'body' in body.keys() else ''
        update_expression += 'title = :title'
        updating = True
        
        
    if updating:
        response = client.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            # You can add ConditionExpression or other parameters as needed
        )
    else:    
        response = client.delete_item(
            Key=key,
            # You can add ConditionExpression or other parameters as needed
        )
    return {
        'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
        'body': json.dumps(response)
    }
