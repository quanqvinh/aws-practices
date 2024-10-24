import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'
import { RemovalPolicy } from 'aws-cdk-lib'

export interface VpcConstructProps {
  /**
   * The maximum number of Availability Zones to use
   * @default 2
   */
  maxAzs?: number

  /**
   * The CIDR range for the VPC
   * @default '10.0.0.0/16'
   */
  cidr?: string

  /**
   * The CIDR mask for the public subnet
   * @default 24
   */
  cidrMask?: number

  /**
   * Whether to map public IP on launch for the public subnet
   * @default true
   */
  mapPublicIpOnLaunch?: boolean

  /**
   * The name of the VPC
   * @default 'VpcDemo'
   */
  vpcName?: string
}

export class VpcConstruct extends Construct {
  public readonly vpc: ec2.Vpc

  constructor(scope: Construct, id: string, props: VpcConstructProps = {}) {
    super(scope, id)

    const {
      maxAzs = 2,
      cidr = '10.0.0.0/16',
      mapPublicIpOnLaunch = true,
      vpcName = 'VpcDemo',
    } = props

    this.vpc = new ec2.Vpc(this, id, {
      maxAzs,
      ipAddresses: ec2.IpAddresses.cidr(cidr),
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
          mapPublicIpOnLaunch,
        },
        {
          cidrMask: 24,
          name: 'PrivateSubnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
      vpcName,
      createInternetGateway: true,
    })
    this.vpc.applyRemovalPolicy(RemovalPolicy.DESTROY)
  }
}
