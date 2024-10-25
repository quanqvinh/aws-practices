import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { VpcConstruct, VpcConstructProps } from './networking/vpc.construct'
import { Ec2Construct } from './computing/ec2.construct'
import * as fs from 'fs'

export class VpcEc2SimpleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const keyPair = new cdk.aws_ec2.KeyPair(this, 'EC2KeyPairDemo', {
      keyPairName: 'ec2-key-pair-demo',
      publicKeyMaterial: fs
        .readFileSync('./credentials/ec2-key-pair.pub')
        .toString(),
    })
    keyPair.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    const {
      vpc: vpc1,
      publicEc2: _vpc1PublicEc2,
      privateEc2: _vpc1PrivateEc2,
    } = this.createVpcWithInstances('Vpc1', keyPair, {
      vpcName: 'Vpc1',
      cidr: '10.0.0.0/16',
    })
    const {
      vpc: vpc2,
      publicEc2: _vpc2PublicEc2,
      privateEc2: _vpc2PrivateEc2,
    } = this.createVpcWithInstances('Vpc2', keyPair, {
      vpcName: 'Vpc2',
      cidr: '10.1.0.0/16',
    })

    const vpcPeeringConnection = new cdk.aws_ec2.CfnVPCPeeringConnection(
      this,
      'VpcPeeringConnection',
      {
        vpcId: vpc1.vpc.vpcId,
        peerVpcId: vpc2.vpc.vpcId,
        tags: [
          {
            key: 'Name',
            value: 'VpcPeeringConnection',
          },
        ],
      },
    )
    vpcPeeringConnection.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    vpc1.vpc.publicSubnets.forEach((subnet, index) => {
      new cdk.aws_ec2.CfnRoute(this, `Vpc1ToVpc2PublicRoute${index + 1}`, {
        routeTableId: subnet.routeTable.routeTableId,
        destinationCidrBlock: vpc2.vpc.vpcCidrBlock,
        vpcPeeringConnectionId: vpcPeeringConnection.ref,
      })
    })
    vpc1.vpc.privateSubnets.forEach((subnet, index) => {
      new cdk.aws_ec2.CfnRoute(this, `Vpc1ToVpc2PrivateRoute${index + 1}`, {
        routeTableId: subnet.routeTable.routeTableId,
        destinationCidrBlock: vpc2.vpc.vpcCidrBlock,
        vpcPeeringConnectionId: vpcPeeringConnection.ref,
      })
    })

    vpc2.vpc.publicSubnets.forEach((subnet, index) => {
      new cdk.aws_ec2.CfnRoute(this, `Vpc2ToVpc1PublicRoute${index + 1}`, {
        routeTableId: subnet.routeTable.routeTableId,
        destinationCidrBlock: vpc1.vpc.vpcCidrBlock,
        vpcPeeringConnectionId: vpcPeeringConnection.ref,
      })
    })
    vpc2.vpc.privateSubnets.forEach((subnet, index) => {
      new cdk.aws_ec2.CfnRoute(this, `Vpc2ToVpc1PrivateRoute${index + 1}`, {
        routeTableId: subnet.routeTable.routeTableId,
        destinationCidrBlock: vpc1.vpc.vpcCidrBlock,
        vpcPeeringConnectionId: vpcPeeringConnection.ref,
      })
    })
  }

  private createVpcWithInstances(
    vpcId: string,
    keyPair: cdk.aws_ec2.KeyPair,
    vpcProps: VpcConstructProps = {},
  ) {
    const vpc = new VpcConstruct(this, vpcId, vpcProps)

    const publicEc2 = new Ec2Construct(this, `${vpcId}-DemoPublicEc2`, {
      vpc: vpc.vpc,
      keyPair,
      associatePublicIpAddress: true,
      instanceName: `${vpcId}-DemoPublicEc2`,
    })
    // Output the instance public IP address
    new cdk.CfnOutput(this, `${vpcId}-InstancePublicIp`, {
      value: publicEc2.instance.instancePublicIp,
      description: `${vpcId} - EC2 Instance Public IP`,
      exportName: `${vpcId}-EC2InstancePublicIp`,
    })

    const privateEc2 = new Ec2Construct(this, `${vpcId}-DemoPrivateEc2`, {
      vpc: vpc.vpc,
      keyPair,
      associatePublicIpAddress: false,
      instanceName: `${vpcId}-DemoPrivateEc2`,
    })
    // Output the instance public IP address
    new cdk.CfnOutput(this, `${vpcId}-InstancePrivateIp`, {
      value: privateEc2.instance.instancePrivateIp,
      description: `${vpcId} - EC2 Instance Private IP`,
      exportName: `${vpcId}-EC2InstancePrivateIp`,
    })

    this.allowPingFromPublicToPrivate(publicEc2, privateEc2)

    return { vpc, publicEc2, privateEc2 }
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
