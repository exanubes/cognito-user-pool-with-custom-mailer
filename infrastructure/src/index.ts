#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { resolveCurrentUserOwnerName } from "@exanubes/cdk-utils";
import { Tags } from "aws-cdk-lib";
import { CognitoStack } from "./stacks/cognito.stack";
require("dotenv").config()

async function main() {
  const owner = await resolveCurrentUserOwnerName();
  const app = new cdk.App();
  new CognitoStack(app, "exanubes-cognito-stack", {});
  Tags.of(app).add("owner", owner);
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
});
