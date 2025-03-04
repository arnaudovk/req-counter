// vpc
module "vpc" {
  source  = "cloudposse/vpc/aws"
  version = "2.1.1"
  name    = "test"

  ipv4_primary_cidr_block = "10.0.0.0/16"

  assign_generated_ipv6_cidr_block = false
}

locals {
  tags = { "kubernetes.io/cluster/req-counter" = "shared" }

  # required tags to make ALB ingress work https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html
  public_subnets_additional_tags = {
    "kubernetes.io/role/elb" : 1
  }
  private_subnets_additional_tags = {
    "kubernetes.io/role/internal-elb" : 1
  }
}

module "subnets" {
  source                          = "cloudposse/dynamic-subnets/aws"
  version                         = "2.4.2"
  name                            = "test"
  vpc_id                          = module.vpc.vpc_id
  igw_id                          = [module.vpc.igw_id]
  ipv4_cidr_block                 = [module.vpc.vpc_cidr_block]
  availability_zones              = ["eu-central-1a", "eu-central-1b"]
  nat_gateway_enabled             = true
  public_subnets_additional_tags  = local.public_subnets_additional_tags
  private_subnets_additional_tags = local.private_subnets_additional_tags
  tags                            = local.tags

}

module "eks" {
  source = "terraform-aws-modules/eks/aws"

  cluster_name                   = "req-counter"
  cluster_version                = "1.32"
  cluster_endpoint_public_access = true

  enable_cluster_creator_admin_permissions = true

  cluster_compute_config = {
    enabled    = true
    node_pools = ["general-purpose"]
  }

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.subnets.private_subnet_ids
}

resource "aws_eks_addon" "example" {
  cluster_name  = module.eks.cluster_name
  addon_name    = "metrics-server"
  addon_version = "v0.7.2-eksbuild.2"
}
