terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.18.1"
    }
  }
  backend "s3" { 
    bucket = "finnholland"
    region = "ap-southeast-2"
    key    = "sagas.tfstate"
    profile = "finnholland"
  }
}

# Define the provider and AWS region
provider "aws" {
  region     = var.region
  access_key = var.ACCESS_KEY
  secret_key = var.SECRET_KEY
}

data "aws_acm_certificate" "certificate" {
  domain = "*.finnholland.dev"
  statuses = ["ISSUED"]
}

resource "aws_dynamodb_table" "ddb_sagas" {
  name = var.name
  hash_key = "id"
  range_key = "createdAt"
  dynamic "attribute" {
    for_each = var.attributes
    content {
      name = attribute.value["name"]
      type = attribute.value["type"]
    }
  }
  global_secondary_index {
    name = "type-createdAt-index"
    hash_key = "type"
    range_key = "createdAt"
    write_capacity = 1
    read_capacity = 1
    projection_type = "ALL"
  }
  read_capacity = 1
  write_capacity = 1
}

resource "aws_apigatewayv2_api" "api_sagas" {
  name = var.name
  protocol_type = "HTTP"
  description = "Created by AWS Lambda"
  cors_configuration {
    allow_credentials = false
    allow_headers  = [
      "*",
    ]
    allow_methods  = [
      "*",
    ]
    allow_origins  = [
      "*",
    ]
    expose_headers = [
      "date,x-api",
    ]
    max_age = 0
  }
}

resource "aws_apigatewayv2_domain_name" "api_domain" {
  domain_name = "api.finnholland.dev"

  domain_name_configuration {
    certificate_arn = data.aws_acm_certificate.certificate.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "api_domain_mapping" {
  api_id      = aws_apigatewayv2_api.api_sagas.id
  domain_name = aws_apigatewayv2_domain_name.api_domain.id
  stage       = aws_apigatewayv2_stage.api_stage.id
}

resource "aws_apigatewayv2_stage" "api_stage" {
  api_id = aws_apigatewayv2_api.api_sagas.id
  name   = "$default"
}

resource "aws_apigatewayv2_integration" "api_integ" {
  count = var.function_count
  api_id           = aws_apigatewayv2_api.api_sagas.id
  integration_type = "AWS_PROXY"

  connection_type           = "INTERNET"
  description               = var.function_names[count.index]
  integration_method        = "POST"
  integration_uri           = aws_lambda_function.lambda_functions[count.index].invoke_arn
  passthrough_behavior      = "WHEN_NO_MATCH"
  payload_format_version    = "2.0"
}

data "aws_s3_bucket" "s3_sagas" {
  bucket = var.name
}

data "archive_file" "archive_file" {
  for_each    = { for i, function in var.function_names : i => function }
  type        = "zip"
  source_file = "${path.module}/lambda/${each.value}.py"
  output_path = "${each.value}.zip"
}

resource "aws_lambda_function" "lambda_functions" {
  count            = var.function_count  
  function_name    = var.function_names[count.index]
  filename         = "${var.function_names[count.index]}.zip"
  source_code_hash = data.archive_file.archive_file[count.index].output_base64sha256
  role             = aws_iam_role.lambda_role.arn
  runtime          = "python3.11"
  handler          = "${var.function_names[count.index]}.lambda_handler"
  timeout          = 3
}

resource "aws_iam_role" "lambda_role" {
  name   = "${var.name}_lambda"
  managed_policy_arns = [
    "arn:aws:iam:::policy/service-role/AWSLambdaBasicExecutionRole-471ca146-cdc3-4877-916b-29f50dec886d",
  ]
  path = "/service-role/"
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
        Resource = [
          "arn:aws:dynamodb:ap-southeast-2::table/sagas",
          "arn:aws:dynamodb:ap-southeast-2::table/sagas/index/*"
        ]
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:ap-southeast-2::log-group:/aws/lambda/*"
      },
      {
        Effect = "Allow",
        Action = "logs:CreateLogGroup",
        Resource = "*"
      }
    ]
    Version   = "2008-10-17"
    })
  }

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}