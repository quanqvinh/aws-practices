import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { VpcConstruct } from './networking/vpc.construct'
import { Ec2Construct } from './computing/ec2.construct'
import * as fs from 'fs'

export class VpcEc2SimpleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const vpc = new VpcConstruct(this, 'Vpc')
    const keyPair = new cdk.aws_ec2.KeyPair(this, 'EC2KeyPairDemo', {
      keyPairName: 'ec2-key-pair-demo',
      publicKeyMaterial: fs
        .readFileSync('./credentials/ec2-key-pair.pub')
        .toString(),
    })
    keyPair.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    const publicEc2 = this.createPublicEc2(vpc, keyPair)
    const privateEc2 = this.createPrivateEc2(vpc, keyPair)

    this.allowPingFromPublicToPrivate(publicEc2, privateEc2)
  }

  private createPublicEc2(
    vpc: VpcConstruct,
    keyPair: cdk.aws_ec2.KeyPair,
  ): Ec2Construct {
    const publicEc2 = new Ec2Construct(this, 'PublicEc2', {
      vpc: vpc.vpc,
      keyPair,
      associatePublicIpAddress: true,
      instanceName: 'DemoPublicEc2',
    })
    // Output the instance public IP address
    new cdk.CfnOutput(this, 'InstancePublicIp', {
      value: publicEc2.instance.instancePublicIp,
      description: 'EC2 Instance Public IP',
      exportName: 'EC2InstancePublicIp',
    })

    return publicEc2
  }

  private createPrivateEc2(vpc: VpcConstruct, keyPair: cdk.aws_ec2.KeyPair) {
    const privateEc2 = new Ec2Construct(this, 'PrivateEc2', {
      vpc: vpc.vpc,
      keyPair,
      associatePublicIpAddress: false,
      instanceName: 'DemoPrivateEc2',
    })
    // Output the instance public IP address
    new cdk.CfnOutput(this, 'InstancePrivateIp', {
      value: privateEc2.instance.instancePrivateIp,
      description: 'EC2 Instance Private IP',
      exportName: 'EC2InstancePrivateIp',
    })

    return privateEc2
  }

  private allowPingFromPublicToPrivate(
    publicEc2: Ec2Construct,
    privateEc2: Ec2Construct,
  ) {
    const publicEc2SecurityGroup =
      publicEc2.instance.connections.securityGroups[0]
    const privateEc2SecurityGroup =
      privateEc2.instance.connections.securityGroups[0]

    // Allow ping (ICMP) from public EC2 to private EC2
    privateEc2SecurityGroup.addIngressRule(
      publicEc2SecurityGroup,
      cdk.aws_ec2.Port.icmpPing(),
      'Allow ping from public EC2',
    )
  }
}
