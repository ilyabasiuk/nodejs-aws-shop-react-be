#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NodejsAwsShopReactBeStack } from '../lib/nodejs-aws-shop-react-be-stack';

const app = new cdk.App();
new NodejsAwsShopReactBeStack(app, 'NodejsAwsShopReactBeStack');
