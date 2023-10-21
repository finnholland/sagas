import json
import boto3
import os
import datetime

tableName=os.environ.get("tableName")
client = boto3.resource("dynamodb").Table(tableName)
type = "blog"

def lambda_handler(event, context):
    body = json.loads(event["body"])
    # body = event
    editedAt = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()
    # TODO implement
    updating = False
    update_expression = "SET editedAt = :editedAt, "
    expression_attribute_values = {
        ":editedAt": editedAt
    }
    key = {
        "id": body["id"],
        'createdAt': body['createdAt']
    }
    
    if 'body' in body.keys() and body['body'] is not None:
        expression_attribute_values[':body'] = body['body']
        update_expression += 'body = :body'
        updating = True
    if 'title' in body.keys() and body['title'] is not None:
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
    elif 'delete' in body.keys() and body['delete']:
        response = client.delete_item(
            Key=key,
        )
    elif 'hide' in body.keys() and body['hide'] is not None:
        response = client.update_item(
            Key=key,
            UpdateExpression="SET visible = :visible",
            ExpressionAttributeValues= {
                ":visible": body['hide']
            }
        )
    return {
        'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
        'body': json.dumps(response)
    }
