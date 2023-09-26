terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.1"
    }
  }
  backend "s3" { }
}

# Define the provider and AWS region
provider "aws" {
  region     = var.region
  access_key = var.ACCESS_KEY
  secret_key = var.SECRET_KEY
}

resource "aws_dynamodb_table" "ddb_sagas" {
  
}

data "aws_s3_bucket" "s3_sagas" {
  bucket = "sagas" 
}


data "archive_file" "archive_getBlogs" {
  type = "zip"  
  source_file = "../lambda/getBlogs.py" 
  output_path = "getBlogs.zip"
}
data "archive_file" "archive_getBlogsFiltered" {
  type = "zip"  
  source_file = "../lambda/getBlogsFiltered.py" 
  output_path = "getBlogsFiltered.zip"
}
data "archive_file" "archive_createBlog" {
  type = "zip"  
  source_file = "../lambda/getBlogsFiltered.py" 
  output_path = "getBlogsFiltered.zip"
}
data "archive_file" "archive_getCurrentUser" {
  type = "zip"  
  source_file = "../lambda/getBlogsFiltered.py" 
  output_path = "getBlogsFiltered.zip"
}

resource "aws_lambda_function" "test_lambda_function" {
        function_name = "getBlogsFiltered"
        filename      = "getBlogsFiltered.zip"
        source_code_hash = data.archive_file.archive_getblogsfiltered.output_base64sha256
        role          = aws_iam_role.lambda_role.arn
        runtime       = "python3.11"
        handler       = "lambda_function.lambda_handler"
        timeout       = 10
}

resource "aws_iam_role" "lambda_role" {
  name   = "sagas_lambda"
  inline_policy {
    name   = "allow_ddb_rw"
    policy = jsonencode({
    Statement = [{
        Effect = "Allow",
        Action = [
          "dynamodb:BatchGetItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ],
        Resource = "arn:aws:dynamodb:eu-west-1:123456789012:table/SampleTable"
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:eu-west-1:123456789012:*"
      },
      {
        Effect = "Allow",
        Action = "logs:CreateLogGroup",
        Resource = "*"
      }
    ]
    Version   = "2012-10-17"
    })
  }
}