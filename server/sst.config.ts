/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "geoguesslite",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const api = new sst.aws.ApiGatewayV2("Api");
    const appSecretArn = `arn:aws:secretsmanager:*:*:secret:geoguesslite-${$app.stage}*`;
    const appSecretPermission = sst.aws.permission({
      actions: ["secretsmanager:GetSecretValue"],
      resources: [appSecretArn],
    });

    api.addAuthorizer({
      name: "firebaseAuthorizer",
      lambda: {
        function: {
          architecture: "arm64",
          runtime: "python3.14",
          handler: "src/core/auth.lambda_handler",
          environment: {
            ENVIRONMENT: $app.stage,
          },
          permissions: [appSecretPermission],
        },
        identitySources: ["$request.header.Authorization"],
        payload: "2.0",
        response: "simple",
        ttl: "0 seconds",
      },
    });

    api.route("GET /api/v1/health", {
      architecture: "arm64",
      runtime: "python3.14",
      handler: "src/api/v1/health/handler.handler",
      environment: {
        ENVIRONMENT: $app.stage,
      },
    });
  },
});
