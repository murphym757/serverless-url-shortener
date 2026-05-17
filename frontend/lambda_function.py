import json
import boto3
import secrets

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('UrlShortener')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

def lambda_handler(event, context):
    http_method = event['requestContext']['http']['method']
    
    # Temporary debug logging
    print('HTTP Method:', http_method)
    print('Path:', event['requestContext']['http']['path'])
    print('Path Parameters:', event.get('pathParameters'))
    
    if http_method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': ''
        }
    
    if http_method == 'POST':
        return create_short_url(event)
    elif http_method == 'GET':
        short_code = event['pathParameters']['shortCode']
        return get_redirect(short_code)
    else:
        return {
            'statusCode': 405,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Method not allowed'})
        }

def create_short_url(event):
    body = json.loads(event['body'])
    print('Received body:', body)
    print('longUrl value:', body.get('longUrl'))
    long_url = body['longUrl']
    short_code = secrets.token_urlsafe(6)
    
    table.put_item(Item={
        'shortCode': short_code,
        'longUrl': long_url
    })
    
    return {
        'statusCode': 201,
        'headers': CORS_HEADERS,
        'body': json.dumps({'shortCode': short_code})
    }

def get_redirect(short_code):
    response = table.get_item(Key={'shortCode': short_code})
    
    if 'Item' not in response:
        return {
            'statusCode': 404,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Short code not found'})
        }
    
    long_url = response['Item']['longUrl']
    
    return {
        'statusCode': 302,
        'headers': {
            **CORS_HEADERS,
            'Location': long_url
        },
        'body': ''
    }