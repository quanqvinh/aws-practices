#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { config } from 'dotenv'
import { VpcEc2SimpleStack } from '../lib/vpc-ec2-simple.stack'

config()

const app = new cdk.App()
new VpcEc2SimpleStack(app, 'VpcEc2SimpleStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
})
