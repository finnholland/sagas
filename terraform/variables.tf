variable "region" {
  default = "ap-southeast-2"
}

variable "ACCESS_KEY" {
  default = ""
}

variable "SECRET_KEY" {
  default = ""
}

variable "name" {
  default = "sagas"
}
variable "function_count" {
  default = 5
}

variable "function_names" {
  default = [
    "getUser","createBlog","getBlogsFiltered","getBlogs","cors"
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