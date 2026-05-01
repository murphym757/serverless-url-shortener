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

![Architecture Diagram](<img width="4257" height="3201" alt="architecture" src="https://github.com/user-attachments/assets/28290e7f-dd09-4bbe-b3b0-b1b750ed8c48" />)

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
