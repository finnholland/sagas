variable "region" {
  default = "ap-southeast-2"
}

variable "name" {
  default = "sagas"
}
variable "env" {
  default = "prod"
}

variable "function_names" {
  default = [
    {
      name  = "getUser"
      route = "GET /getUser"
    },
    {
      name  = "createBlog"
      route = "POST /createBlog"
    },
    {
      name  = "getBlogsFiltered"
      route = "GET /getBlogsFiltered"
    },
    {
      name  = "getBlogs"
      route = "GET /getBlogs"
    },
    {
      name  = "cors"
      route = "OPTIONS /{proxy+}"
    },
    {
      name  = "updateBlog"
      route = "POST /updateBlog"
    },
    {
      name  = "saveDraft"
      route = "POST /saveDraft"
    }
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