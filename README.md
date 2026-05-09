# serverless-url-shortener
Serverless URL shortener built on AWS: Lambda, API Gateway, DynamoDB, S3, CloudFront

# Serverless URL Shortener

A serverless URL shortening API built on AWS. Submit a long URL, 
receive a short code. Hit the short code, get redirected to the 
original URL instantly.

Built as part of my Cloud Engineering portfolio while transitioning 
into AWS/DevOps roles. Every service was provisioned and configured 
manually to build real operational understanding — not a tutorial follow-along.

## Architecture

![Architecture Diagram](https://github.com/user-attachments/assets/28290e7f-dd09-4bbe-b3b0-b1b750ed8c48)

## AWS Services

| Service | Purpose | Resource |
|--------|---------|----------|
| AWS Lambda | Serverless compute — handles POST and GET logic | `urlShortenerFunction` |
| Amazon DynamoDB | NoSQL key-value store for URL mappings | `UrlShortener` table |
| Amazon API Gateway | Public HTTP endpoints — routes requests to Lambda | In progress |
| Amazon S3 | Static frontend hosting | Coming next |
| Amazon CloudFront | CDN + HTTPS for the frontend | Coming next |
| AWS IAM | Least privilege execution role for Lambda | `UrlShortenerDynamoDBPolicy` |
| Amazon CloudWatch | Lambda execution logging and monitoring | Auto-configured |

## How It Works

**Shorten a URL — POST /shorten**

**Base URL:** `https://tmmfw1sqq3.execute-api.us-east-1.amazonaws.com`

**Shorten a URL:**
POST /shorten → returns shortCode

**Redirect:**
GET /{shortCode} → 302 redirect to original URL

## What Broke (and What I Learned)

**AccessDeniedException on Lambda creation**
The `url-shortener-dev` IAM user didn't have `iam:CreateRole` 
permission. Lambda needs to create an execution role automatically 
on function creation. Fixed by adding `IAMFullAccess` to the user 
via the Admin account. Lesson: always check what IAM permissions 
your user needs before creating resources.

**ResourceNotFoundException on PutItem — region mismatch**
Lambda was deployed in `us-east-2`, DynamoDB table was in `us-east-1`. 
AWS services can only communicate within the same region by default. 
Recreated Lambda in `us-east-1` to match the table. Lesson: pick 
one region before you start and never deviate.

**AccessDeniedException on PutItem**
Lambda execution role had no DynamoDB permissions by default — only 
CloudWatch logging. Added `AmazonDynamoDBFullAccess` temporarily to 
unblock testing, then replaced with a custom inline policy scoped to 
exactly `dynamodb:PutItem` and `dynamodb:GetItem` on one specific 
table ARN. Lesson: least privilege means adding only what you need, 
nothing more.

**boto3 defaulting to wrong region**
boto3 without an explicit region specified defaulted to the wrong 
region intermittently. Fixed by passing `region_name='us-east-1'` 
to `boto3.resource()`. Lesson: always hardcode the region in boto3 
clients, never rely on defaults.

**GET redirect returning empty shortCode**
The path parameter extraction was failing because the event structure 
from API Gateway differs from manually crafted test events. Fixed by 
using `event['pathParameters']['shortCode']` instead of manually 
stripping the path string. Lesson: always test with real API Gateway 
requests, not just Lambda test events.

**CORS — the big one**
The React frontend on localhost was blocked from calling the API 
Gateway endpoint due to CORS policy. The browser sends an OPTIONS 
preflight request before every cross-origin POST. API Gateway was 
returning 404 on OPTIONS because the route didn't exist. Fixed by:
1. Adding explicit OPTIONS routes in API Gateway for both 
   `/shorten` and `/{shortCode}`
2. Adding CORS headers to every Lambda response
3. Adding an explicit OPTIONS handler in Lambda that returns 200
4. Deleting and recreating the API Gateway entirely when 
   deployment issues prevented changes from taking effect
Lesson: CORS requires headers in both API Gateway AND Lambda 
responses. The preflight OPTIONS request must have its own route.

**302 redirect returning API Gateway URL instead of destination**
DynamoDB was storing the API Gateway URL as the longUrl instead 
of the user's input. Debugged using CloudWatch print statements 
to trace the value through Lambda. Turned out to be a caching/
propagation issue that resolved once API Gateway fully deployed.
Lesson: CloudWatch logging is essential for tracing data through 
serverless functions. Always add print statements when debugging.
