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
      jwt   = false
    },
    {
      name  = "createBlog"
      route = "POST /createBlog"
      jwt   = true
    },
    {
      name  = "getBlogsFiltered"
      route = "GET /getBlogsFiltered"
      jwt   = false
    },
    {
      name  = "getBlogs"
      route = "GET /getBlogs"
      jwt   = false
    },
    {
      name  = "cors"
      route = "OPTIONS /{proxy+}"
      jwt   = false
    },
    {
      name  = "updateBlog"
      route = "POST /updateBlog"
      jwt   = true
    },
    {
      name  = "saveDraft"
      route = "POST /saveDraft"
      jwt   = true
    },
    {
      name  = "createComment"
      route = "POST /createComment"
      jwt   = false
    },
    {
      name  = "likeItem"
      route = "POST /likeItem"
      jwt   = false
    },
    {
      name  = "getComments"
      route = "GET /getComments"
      jwt   = false
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

variable "cog_user" {
  default = {
    id = "0a6d1f96-70ca-407b-a99c-569bb425faca"
    email = ""
    phone = ""
  }
}