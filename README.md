# Serverless URL Shortener

A serverless URL shortening API built on AWS. Submit a long URL, 
receive a short code. Hit the short code, get redirected to the 
original URL instantly.

Built as part of my Cloud Engineering portfolio while transitioning 
into AWS/DevOps roles. Every service was provisioned and configured 
manually to build real operational understanding — not a tutorial follow-along.

## Live Demo
https://d1ft8ojjt95ptr.cloudfront.net

## Architecture

![Architecture Diagram](https://github.com/user-attachments/assets/03935551-3169-4619-8cb5-f03f84bf2332)

## AWS Services

| Service | Purpose | Resource |
|--------|---------|----------|
| AWS Lambda | Serverless compute — handles POST and GET logic | `urlShortenerFunction` |
| Amazon DynamoDB | NoSQL key-value store for URL mappings | `UrlShortener` table |
| Amazon API Gateway | Public HTTP endpoints — routes requests to Lambda | `uh8qjzjp1f.execute-api.us-east-1.amazonaws.com` |
| Amazon S3 | Static frontend hosting | `serverless-url-shortener-frontend-miami` |
| Amazon CloudFront | CDN + HTTPS + OAC security | `dwkkik0xw1yy0.cloudfront.net` |
| AWS IAM | Least privilege execution role for Lambda | `UrlShortenerDynamoDBPolicy` |
| Amazon CloudWatch | Lambda execution logging and monitoring | Auto-configured |

## How It Works

**Shorten a URL — POST /shorten
Request:  { "longUrl": "https://www.youtube.com" }
Response: { "shortCode": "ab3kR9" }**

**Redirect**
GET /{shortCode}
Response: 302 redirect → original URL

**Base URL:** `https://uh8qjzjp1f.execute-api.us-east-1.amazonaws.com`

## Security Design

**IAM Least Privilege**
The Lambda execution role (`UrlShortenerDynamoDBPolicy`) is scoped 
to exactly two DynamoDB actions on one specific table ARN:
- `dynamodb:PutItem` — write new URL mappings
- `dynamodb:GetItem` — read existing URL mappings

No wildcard permissions. `AmazonDynamoDBFullAccess` was attached 
temporarily during development and replaced with this custom inline 
policy before moving forward.

**S3 Origin Access Control (OAC)**
S3 bucket has Block All Public Access enabled. CloudFront accesses 
the bucket exclusively via Origin Access Control — no direct S3 
access is possible. The bucket policy allows only the specific 
CloudFront distribution ARN to perform `s3:GetObject`.

## What Broke (and What I Learned)

**AccessDeniedException on Lambda creation**
The `url-shortener-dev` IAM user didn't have `iam:CreateRole` 
permission. Lambda needs to create an execution role automatically 
on function creation. Fixed by adding `IAMFullAccess` to the user 
via the Admin account. Lesson: always check what IAM permissions 
your user needs before creating resources.

**ResourceNotFoundException — region mismatch**
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
Path parameter extraction was failing because the event structure 
from API Gateway differs from manually crafted Lambda test events. 
Fixed by using `event['pathParameters']['shortCode']` instead of 
manually stripping the path string. Lesson: always test with real 
API Gateway requests, not just Lambda test events.

**CORS**
React frontend on localhost was blocked from calling the API Gateway 
endpoint. The browser sends an OPTIONS preflight request before every 
cross-origin POST. API Gateway was returning 404 on OPTIONS because 
the route didn't exist. Fixed by:
1. Adding explicit OPTIONS routes in API Gateway for `/shorten` 
   and `/{shortCode}`
2. Adding CORS headers to every Lambda response
3. Adding an explicit OPTIONS handler in Lambda
4. Deleting and recreating API Gateway when deployment changes 
   weren't taking effect
Lesson: CORS requires headers in both API Gateway AND Lambda. 
The OPTIONS preflight route must exist and Lambda must handle it.

**S3 AccessDenied on CloudFront**
Initial CloudFront setup returned 403 because S3 had Block All 
Public Access enabled. Temporarily disabled public access to confirm 
the setup worked, then implemented Origin Access Control (OAC) — 
the production-correct approach that keeps the bucket private. 
Lesson: never make an S3 bucket public for CloudFront. Use OAC.

## Project Status

- [x] DynamoDB table
- [x] Lambda function — POST and GET operations  
- [x] IAM — least privilege execution role
- [x] CloudWatch — execution logging
- [x] API Gateway — HTTP endpoints
- [x] React frontend — TypeScript + Vite
- [x] S3 — static hosting
- [x] CloudFront — CDN + HTTPS + OAC

## Stack

- **Runtime:** Python 3.14
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Region:** us-east-1
- **Database:** DynamoDB (on-demand capacity)
- **Compute:** Lambda (128MB, default timeout)

## Author

Maurice Murphy — Full-Stack Developer transitioning into Cloud Engineering.  
Targeting AWS Solutions Architect Associate certification Q3 2026.
