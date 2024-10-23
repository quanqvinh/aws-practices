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

    const _ec2 = new Ec2Construct(this, 'Ec2', {
      vpc: vpc.vpc,
      keyPair,
    })
  }
}
