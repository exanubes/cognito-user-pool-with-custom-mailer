import {CfnOutput, Duration, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import { UserPool, UserPoolOperation } from "aws-cdk-lib/aws-cognito";
import { Key, KeySpec } from "aws-cdk-lib/aws-kms";
import { Code, Runtime, Function } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import { Construct } from "constructs";
import {
  Effect,
  Policy,
  PolicyStatement,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";

const keyAlias = "exanubes-mailer-key-alias";

export class CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const { region, account } = Stack.of(this);
    const cmk = this.createCustomManagedKey();
    const userPool = this.createUserPool(cmk);
    const keyAliasArn = `arn:aws:kms:${region}:${account}:alias/${keyAlias}`;
    const customEmailer = this.createCustomEmailer(cmk, keyAliasArn);
    this.setPermissions(cmk, customEmailer);

    userPool.addTrigger(UserPoolOperation.CUSTOM_EMAIL_SENDER, customEmailer);
  }

  private createUserPool(cmk: Key): UserPool {
    const userPool = new UserPool(this, "exanubes-user-pool", {
      userPoolName: "exanubes_user_pool",
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
      removalPolicy: RemovalPolicy.DESTROY,

      standardAttributes: {
        email: { required: true, mutable: false },
      },
      autoVerify: { email: true },
      customSenderKmsKey: cmk,
    });

    const client = userPool.addClient("exanubes-user-pool-client", {
      userPoolClientName: "exanubes-cognito-app",
      authFlows: {
        userPassword: true,
      },
      accessTokenValidity: Duration.days(1),
      idTokenValidity: Duration.days(1),
      refreshTokenValidity: Duration.days(30),
      preventUserExistenceErrors: true,
    });

    new CfnOutput(this, 'exanubes-user-pool-client-id', {
      value: client.userPoolClientId,
    });

    return userPool;
  }

  private createCustomManagedKey(): Key {
    return new Key(this, "KMS-Symmetric-Key", {
      keySpec: KeySpec.SYMMETRIC_DEFAULT,
      alias: keyAlias,
      enableKeyRotation: false,
    });
  }

  private createCustomEmailer(cmk: Key, keyAliasArn: string): Function {
    return new Function(this, "custom-emailer-lambda", {
      code: Code.fromAsset(
        join(__dirname, "..", "lambdas/custom-email-sender")
      ),
      runtime: Runtime.NODEJS_14_X,
      handler: "index.handler",
      environment: {
        KEY_ID: cmk.keyArn,
        KEY_ALIAS: keyAliasArn,
        SENDGRID_API_KEY: String(process.env.SENDGRID_API_KEY),
      },
    });
  }

  private setPermissions(key: Key, lambda: Function): void {
    // Allow Cognito Service to use key for encryption
    key.addToResourcePolicy(
      new PolicyStatement({
        actions: ["kms:Encrypt"],
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("cognito-idp.amazonaws.com")],
        resources: ["*"],
      })
    );

    // Allow custom emailer lambda to use key
    lambda.role!.attachInlinePolicy(
      new Policy(this, "userpool-policy", {
        statements: [
          new PolicyStatement({
            actions: ["kms:Decrypt", "kms:DescribeKey"],
            effect: Effect.ALLOW,
            resources: [key.keyArn],
          }),
        ],
      })
    );

    // Allow cognito to use lambda
    lambda.addPermission("exanubes-cognito-custom-mailer-permission", {
      principal: new ServicePrincipal("cognito-idp.amazonaws.com"),
      action: "lambda:InvokeFunction",
    });
  }
}
