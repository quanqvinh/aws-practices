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
  }
}
