import json
import os
import time
import boto3

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('DYNAMODB_TABLE', 'EcoBuildCore')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    
    # Determine HTTP method from API Gateway event payload
    http_context = event.get('requestContext', {}).get('http', {})
    method = http_context.get('method') or event.get('httpMethod')
    
    # Handle CORS preflight requests
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,DELETE'
            },
            'body': ''
        }

    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }

    try:
        # 1. GET: Fetch all active listings from DynamoDB
        if method == 'GET':
            response = table.scan()
            items = response.get('Items', [])
            # Filter only listing records
            listings = [item for item in items if str(item.get('PK', '')).startswith('LISTING#')]
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(listings)
            }

        # 2. POST: Save a new waste listing to DynamoDB
        elif method == 'POST':
            body_data = event.get('body')
            if not body_data:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Missing request body'})}
            
            listing = json.loads(body_data)
            listing_id = str(listing.get('id') or int(time.time() * 1000))
            
            item = {
                'PK': f"LISTING#{listing_id}",
                'SK': 'METADATA',
                'id': listing_id,
                'category': listing.get('category', 'Concrete Rubble'),
                'priceType': listing.get('priceType', 'Free'),
                'price': str(listing.get('price', '0')),
                'imageUrl': listing.get('imageUrl', ''),
                'location': listing.get('location', 'Delhi'),
                'lat': str(listing.get('lat', '28.6139')),
                'lon': str(listing.get('lon', '77.2090')),
                'description': listing.get('description', ''),
                'phone': listing.get('phone', ''),
                'sellerName': listing.get('sellerName', 'Verified Contributor'),
                'timeAgo': listing.get('timeAgo', 'Just now')
            }
            
            table.put_item(Item=item)
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps({'message': 'Listing saved successfully', 'listing': item})
            }

        # 3. DELETE: Remove a listing by ID
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            listing_id = query_params.get('id')
            
            if not listing_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Missing listing id parameter'})}
            
            table.delete_item(
                Key={
                    'PK': f"LISTING#{listing_id}",
                    'SK': 'METADATA'
                }
            )
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': f'Listing {listing_id} deleted successfully'})
            }

        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': f'Unsupported method: {method}'})
        }

    except Exception as e:
        print("Error processing request:", str(e))
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }