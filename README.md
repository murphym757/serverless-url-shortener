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

## What Broke

- AccessDeniedException on Lambda creation — url-shortener-dev 
  needed iam:CreateRole permission
- ResourceNotFoundException — Lambda in us-east-2, 
  DynamoDB in us-east-1. Recreated Lambda in us-east-1
- AccessDeniedException on PutItem — Lambda execution role 
  had no DynamoDB permissions. Added then scoped down to 
  custom inline policy
- 302 vs 200 — redirect needs Location header not JSON response
- There were no CORS issues at all
