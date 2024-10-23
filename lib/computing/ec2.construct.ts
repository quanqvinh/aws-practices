import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'
import { RemovalPolicy } from 'aws-cdk-lib'

export interface Ec2ConstructProps {
  /**
   * The VPC to launch the EC2 instance in
   */
  vpc: ec2.IVpc

  /**
   * The instance type
   * @default t2.micro
   */
  instanceType?: ec2.InstanceType

  /**
   * The name of the EC2 instance
   * @default 'demo-ec2-instance'
   */
  instanceName?: string

  /**
   * The Amazon Machine Image (AMI) to use
   * @default Latest Amazon Linux 2 AMI
   */
  machineImage?: ec2.IMachineImage

  /**
   * Whether to associate a public IP address with the instance
   * @default true
   */
  associatePublicIpAddress?: boolean

  /**
   * The key pair to use for the instance
   * @default - A new key pair will be created
   */
  keyPair?: ec2.IKeyPair
}

export class Ec2Construct extends Construct {
  public readonly instance: ec2.Instance

  constructor(scope: Construct, id: string, props: Ec2ConstructProps) {
    super(scope, id)

    const {
      vpc,
      instanceType = ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      instanceName = 'DemoEc2',
      machineImage = ec2.MachineImage.latestAmazonLinux2(),
      associatePublicIpAddress = true,
      keyPair,
    } = props

    // Create a security group for the EC2 instance
    const securityGroup = new ec2.SecurityGroup(this, 'EC2SecurityGroup', {
      vpc,
      description: 'Security group for EC2 instance',
      allowAllOutbound: true,
    })

    // Apply removal policy to the security group
    securityGroup.applyRemovalPolicy(RemovalPolicy.DESTROY)

    // Allow SSH access on port 22
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH access',
    )

    // Allow HTTP access on port 80
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP access',
    )

    // Create the EC2 instance
    this.instance = new ec2.Instance(this, 'EC2Instance', {
      vpc,
      instanceType,
      machineImage,
      securityGroup,
      vpcSubnets: {
        subnetType: associatePublicIpAddress
          ? ec2.SubnetType.PUBLIC
          : ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      keyPair,
    })

    // Add name tag to the instance
    cdk.Tags.of(this.instance).add('Name', instanceName)

    // Apply removal policy to the instance
    this.instance.applyRemovalPolicy(RemovalPolicy.DESTROY)

    // Output the instance public IP address
    new cdk.CfnOutput(this, 'InstancePublicIp', {
      value: this.instance.instancePublicIp,
      description: 'EC2 Instance Public IP',
      exportName: 'EC2InstancePublicIp',
    })
  }
}
