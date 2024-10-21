#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { AwsPracticesStack } from '../lib/aws-practices-stack'
import { config } from 'dotenv'

config()

const app = new cdk.App()
new AwsPracticesStack(app, 'AwsPracticesStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION,
  },
})
