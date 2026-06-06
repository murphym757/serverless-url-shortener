terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "~> 5.0"
        }
    }

    required_version = ">= 1.0"
}

resource "aws_dynamodb_table" "url_shortener" {
    name         = "UrlShortener"
    billing_mode = "PAY_PER_REQUEST"
    hash_key     = "shortCode"

    attribute {
        name = "shortCode"
        type = "S"
    }

    tags = {
        Project = "serverless-url-shortener"
    }
}

provider "aws" {
    region = "us-east-1"
}