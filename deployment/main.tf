terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}

variable "cidr_block" {
    default = "10.0.0.0/16"
}

resource "aws_vpc" "listflow_vpc" {
    cidr_block = var.cidr_block
    tags = {
        Name = "listflow_vpc"
    }
}

resource "aws_subnet" "listflow_subnet" {
    vpc_id = aws_vpc.listflow_vpc.id
    cidr_block = "10.0.0.0/24"
    availability_zone = "us-east-1a"
    map_public_ip_on_launch = true
    tags = {
        Name = "listflow_subnet"
    }
}

resource "aws_internet_gateway" "listflow_igw" {
    vpc_id = aws_vpc.listflow_vpc.id
    tags = {
        Name = "listflow_igw"
    }
}

resource "aws_route_table" "listflow_rt" {
    vpc_id = aws_vpc.listflow_vpc.id
    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.listflow_igw.id
    }
}

resource "aws_route_table_association" "listflow_rta" {
    subnet_id = aws_subnet.listflow_subnet.id
    route_table_id = aws_route_table.listflow_rt.id
}

resource "aws_security_group" "listflow_sg" {
    name = "listflow_sg"
    description = "Web traffic and SSH"
    vpc_id = aws_vpc.listflow_vpc.id

    ingress {
        description = "HTTP ingress"
        from_port = 80
        to_port = 3000
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "SMTP ingress"
        from_port = 587
        to_port = 587
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "SSH ingress"
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        description = "HTTP egress"
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name = "listflow_sg"
    }
}

locals {
  env_vars = {
    MONGO_URI       = var.MONGO_URI
    OPENAI_API_KEY  = var.OPENAI_API_KEY
    GEMINI_API_KEY  = var.GEMINI_API_KEY
    AWS_ACCESS_KEY_ID = var.AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY = var.AWS_SECRET_ACCESS_KEY
    BUCKET_NAME = var.BUCKET_NAME
    BUCKET_REGION = var.BUCKET_REGION
  }
}

// need to create prod s3 bucket and iam role
// https://stackoverflow.com/questions/61302342/mongodb-sets-my-database-to-test-automatically-how-to-change-it

variable "MONGO_URI" { type = string }
variable "OPENAI_API_KEY" { type = string }
variable "GEMINI_API_KEY" { type = string }
variable "AWS_ACCESS_KEY_ID" { type = string }
variable "AWS_SECRET_ACCESS_KEY" { type = string }
variable "BUCKET_NAME" { type = string }
variable "BUCKET_REGION" { type = string }

resource "aws_instance" "listflow_server" {
  ami           = "ami-0e2c8caa4b6378d8c"
  instance_type = "t2.micro"
  vpc_security_group_ids = [aws_security_group.listflow_sg.id]
  subnet_id = aws_subnet.listflow_subnet.id

  // for logs: cat /var/log/cloud-init-output.log
  user_data = templatefile("./user_data.sh", local.env_vars)

  tags = {
    Name = "listflow_server"
  }
}

resource "aws_eip_association" "listflow_eip" {
  allocation_id = "eipalloc-029eb7371f8fd6175"
  instance_id   = aws_instance.listflow_server.id
}
