variable "region" {
  default = "ap-southeast-2"
}

variable "name" {
  default = "sagas"
}
variable "domain_name" {
  default = "finnholland.dev"
}
variable "env" {
  default = "prod"
}
variable "runtime" {
  default = "python3.11"
}

variable "AWS_ID" {
  default = ""
}

variable "function_names" {
  default = [
    {
      name  = "getUser"
      route = "GET /getUser"
      jwt   = false
      layers = false
    },
    {
      name  = "createBlog"
      route = "POST /createBlog"
      jwt   = true
      layers = false
    },
    {
      name  = "getBlogsFiltered"
      route = "GET /getBlogsFiltered"
      jwt   = false
      layers = false
    },
    {
      name  = "getBlogs"
      route = "GET /getBlogs"
      jwt   = false
      layers = false
    },
    {
      name  = "cors"
      route = "OPTIONS /{proxy+}"
      jwt   = false
      layers = false
    },
    {
      name  = "updateBlog"
      route = "POST /updateBlog"
      jwt   = true
      layers = false
    },
    {
      name  = "saveDraft"
      route = "POST /saveDraft"
      jwt   = true
      layers = false
    },
    {
      name  = "createComment"
      route = "POST /createComment"
      jwt   = false
      layers = true
    },
    {
      name  = "likeItem"
      route = "POST /likeItem"
      jwt   = false
      layers = false
    },
    {
      name  = "getComments"
      route = "GET /getComments"
      jwt   = false
      layers = false
    },
  ]
}

variable "attributes" {
  default = [
  {
    name = "id"
    type = "S"
  },
  {
    name = "createdAt"
    type = "S"
  },
  {
    name = "type"
    type = "S"
  },
]
}

variable "id" {}
variable "email" {}
variable "phone" {}