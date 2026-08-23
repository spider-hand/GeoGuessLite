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
    const cleanupSinglePlayerGames = new sst.aws.Function(
      "CleanupSinglePlayerGames",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/jobs/cleanup_expired_single_player_games.cleanup_expired_single_player_games",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
    );

    const firebaseAuthorizer = api.addAuthorizer({
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

    api.route(
      "POST /api/v1/single-player-games",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/single_player_games/handler.create_single_player_game",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "GET /api/v1/single-player-games",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/single_player_games/handler.get_single_player_games",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "GET /api/v1/single-player-games/{gameId}",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/single_player_games/handler.get_single_player_game",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/single-player-games/{gameId}/rounds/{roundNumber}/start",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/single_player_games/handler.start_single_player_game_round",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/single-player-games/{gameId}/rounds/{roundNumber}/guesses",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/single_player_games/handler.create_single_player_game_guess",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "GET /api/v1/users/{userId}",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/users/handler.get_user",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "GET /api/v1/users/me",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/users/handler.get_current_user",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/users/me",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/users/handler.create_user",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "PATCH /api/v1/users/me",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/users/handler.update_user",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "DELETE /api/v1/users/me",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/api/v1/users/handler.delete_user",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    new sst.aws.CronV2("DeleteExpiredSinglePlayerGames", {
      schedule: "cron(0 0 * * ? *)",
      function: cleanupSinglePlayerGames,
    });
  },
});
