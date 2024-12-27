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
  }
}

variable "MONGO_URI" { type = string }
variable "OPENAI_API_KEY" { type = string }
variable "GEMINI_API_KEY" { type = string }

// for logs: cat /var/log/cloud-init-output.log

resource "aws_instance" "listflow_server" {
  ami           = "ami-0e2c8caa4b6378d8c"
  instance_type = "t2.micro"
  vpc_security_group_ids = [aws_security_group.listflow_sg.id]
  subnet_id = aws_subnet.listflow_subnet.id

  user_data = templatefile("./user_data.sh", local.env_vars)

  tags = {
    Name = "listflow_server"
  }
}

output "aws_instance_public_ip" {
    value = aws_instance.listflow_server.public_ip
}