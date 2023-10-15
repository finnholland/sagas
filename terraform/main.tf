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
    key    = "sagas_prod.tfstate"
    profile = "finnholland" # make this your local aws profile.
  }
}

# Define the provider and AWS region
provider "aws" {
  region     = var.region
  profile = "finnholland" # make this your local aws profile.
}

data "aws_acm_certificate" "certificate" {
  domain = "finnholland.dev"
  statuses = ["ISSUED"]
}

resource "aws_dynamodb_table" "ddb_sagas" {
  name = "${var.name}_${var.env}"
  hash_key = "id"
  range_key = "createdAt"
  dynamic "attribute" {
    for_each = var.attributes
    content {
      name = attribute.value["name"]
      type = attribute.value["type"]
    }
  }
  global_secondary_index { // for blogs, we know type = blog and 
    name = "type-createdAt-index"
    hash_key = "type"
    range_key = "createdAt"
    write_capacity = 1
    read_capacity = 1
    projection_type = "ALL"
  }
  global_secondary_index { // used to get a user by id since the createdAt is not usually known
    name = "user-index"
    hash_key = "id"
    write_capacity = 1
    read_capacity = 1
    projection_type = "ALL"
  }
  read_capacity = 1
  write_capacity = 1
}

resource "aws_apigatewayv2_api" "api_sagas" {
  name = "${var.name}_${var.env}"
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
  domain_name = "${var.name}${var.env == "prod" ? "" : var.env}.api.finnholland.dev"

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
  name   = "default"
  auto_deploy = true
  description = "Default API stage for ${var.name} ${var.env}"
}

resource "aws_apigatewayv2_integration" "api_integ" {
  count = length(var.function_names)
  api_id           = aws_apigatewayv2_api.api_sagas.id
  integration_type = "AWS_PROXY"

  connection_type           = "INTERNET"
  description               = "${var.function_names[count.index].name} ${var.env} integration"
  integration_method        = "POST"
  integration_uri           = aws_lambda_function.lambda_functions[count.index].invoke_arn
  passthrough_behavior      = "WHEN_NO_MATCH"
  payload_format_version    = "2.0"
}

resource "aws_apigatewayv2_route" "api_routes" {
  count = length(var.function_names)
  
  api_id    = aws_apigatewayv2_api.api_sagas.id
  route_key = var.function_names[count.index].route
  target    = "integrations/${aws_apigatewayv2_integration.api_integ[count.index].id}"
}

data "aws_s3_bucket" "s3_sagas" {
  bucket = var.name
}

data "archive_file" "archive_file" {
  for_each    = { for i, function in var.function_names : i => function }
  type        = "zip"
  source_file = "${path.module}/lambda/${each.value.name}.py"
  output_path = "${each.value.name}.zip"
}

resource "aws_lambda_function" "lambda_functions" {
  count            = length(var.function_names)  
  function_name    = "${var.function_names[count.index].name}_${var.env}"
  filename         = "${var.function_names[count.index].name}.zip"
  source_code_hash = data.archive_file.archive_file[count.index].output_base64sha256
  role             = aws_iam_role.lambda_role.arn
  runtime          = "python3.11"
  handler          = "${var.function_names[count.index].name}.lambda_handler"
  timeout          = 3
  environment {
    variables = {
      tableName = aws_dynamodb_table.ddb_sagas.name
    }
  }
}

resource "aws_lambda_permission" "api_permission" {
  for_each      = { for i, function in var.function_names : i => function }
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${each.value.name}_${var.env}"
  principal     = "apigateway.amazonaws.com"
}

resource "aws_iam_user" "sagas_user" {
  name = "${var.name}_user_${var.env}"
}

resource "aws_iam_user_policy" "s3_write_policy" {
  user   = aws_iam_user.sagas_user.name
  name   = "${var.name}_s3_write_policy_${var.env}"
  policy = jsonencode({
    Statement = [
      {
        Effect   = "Allow",
        Action   = "s3:PutObject",
        Resource = "arn:aws:s3:::sagas/${var.env}*"
      },
      {
        Effect   = "Deny",
        Action   = "s3:PutObject",
        Resource = "arn:aws:s3:::sagas/default_profiles*"
      },
    ]
    Version      = "2012-10-17"
  })
}

resource "aws_iam_role" "lambda_role" {
  name   = "${var.name}_lambda_${var.env}"
  managed_policy_arns = [
    "arn:aws:iam::653559667045:policy/service-role/AWSLambdaBasicExecutionRole-471ca146-cdc3-4877-916b-29f50dec886d",
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
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ],
        Resource = [
          "arn:aws:dynamodb:ap-southeast-2:653559667045:table/${aws_dynamodb_table.ddb_sagas.name}",
          "arn:aws:dynamodb:ap-southeast-2:653559667045:table/${aws_dynamodb_table.ddb_sagas.name}/index/*"
        ]
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:ap-southeast-2:653559667045:log-group:/aws/lambda/*"
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

data "aws_route53_zone" "r53_sagas" {
  name = "finnholland.dev"
}

resource "aws_route53_record" "api_record" {
  zone_id = data.aws_route53_zone.r53_sagas.id
  name    = "sagas${var.env == "prod" ? "" : var.env}.api.finnholland.dev"
  type    = "A"

  alias {
    name    = aws_apigatewayv2_domain_name.api_domain.domain_name_configuration[0].target_domain_name
    zone_id = aws_apigatewayv2_domain_name.api_domain.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = true
  }
}