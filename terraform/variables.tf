variable "region" {
  default = "ap-southeast-2"
}

variable "name" {
  default = "sagas"
}
variable "function_count" {
  default = 6
}

variable "function_names" {
  default = [
    "getUser","createBlog","getBlogsFiltered","getBlogs","cors","updateBlog"
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