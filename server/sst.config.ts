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
    const withFriendsGameStartDlq = new sst.aws.Queue(
      "WithFriendsGameStartDLQ",
    );
    const withFriendsGameStartQueue = new sst.aws.Queue(
      "WithFriendsGameStart",
      {
        delay: "5 seconds",
        dlq: { queue: withFriendsGameStartDlq.arn, retry: 3 },
      },
    );
    const withFriendsRoundTimeoutDlq = new sst.aws.Queue(
      "WithFriendsRoundTimeoutDLQ",
    );
    const withFriendsRoundTimeoutQueue = new sst.aws.Queue(
      "WithFriendsRoundTimeout",
      {
        delay: "60 seconds",
        dlq: { queue: withFriendsRoundTimeoutDlq.arn, retry: 3 },
      },
    );
    const withFriendsRoundAdvanceDlq = new sst.aws.Queue(
      "WithFriendsRoundAdvanceDLQ",
    );
    const withFriendsRoundAdvanceQueue = new sst.aws.Queue(
      "WithFriendsRoundAdvance",
      {
        delay: "15 seconds",
        dlq: { queue: withFriendsRoundAdvanceDlq.arn, retry: 3 },
      },
    );
    const withFriendsGameStartSendPermission = sst.aws.permission({
      actions: ["sqs:SendMessage"],
      resources: [withFriendsGameStartQueue.arn],
    });
    const withFriendsRoundTimeoutSendPermission = sst.aws.permission({
      actions: ["sqs:SendMessage"],
      resources: [withFriendsRoundTimeoutQueue.arn],
    });
    const withFriendsRoundAdvanceSendPermission = sst.aws.permission({
      actions: ["sqs:SendMessage"],
      resources: [withFriendsRoundAdvanceQueue.arn],
    });
    const queueReceiveActions = [
      "sqs:ChangeMessageVisibility",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:GetQueueUrl",
      "sqs:ReceiveMessage",
    ];
    const withFriendsGameStartReceivePermission = sst.aws.permission({
      actions: queueReceiveActions,
      resources: [withFriendsGameStartQueue.arn],
    });
    const withFriendsRoundTimeoutReceivePermission = sst.aws.permission({
      actions: queueReceiveActions,
      resources: [withFriendsRoundTimeoutQueue.arn],
    });
    const withFriendsRoundAdvanceReceivePermission = sst.aws.permission({
      actions: queueReceiveActions,
      resources: [withFriendsRoundAdvanceQueue.arn],
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
    const createDailyChallenge = new sst.aws.Function(
      "CreateDailyChallenge",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler: "src/jobs/create_daily_challenge.create_daily_challenge",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
    );
    const cleanupDailyChallenges = new sst.aws.Function(
      "CleanupDailyChallenges",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/jobs/cleanup_expired_daily_challenges.cleanup_expired_daily_challenges",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
    );
    const cleanupWithFriendsGames = new sst.aws.Function(
      "CleanupWithFriendsGames",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/jobs/cleanup_expired_with_friends_games.cleanup_expired_with_friends_games",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
    );
    const withFriendsGameStartWorker = new sst.aws.Function(
      "WithFriendsGameStartWorker",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/jobs/process_with_friends_game_start.process_with_friends_game_start",
        environment: {
          ENVIRONMENT: $app.stage,
          WITH_FRIENDS_ROUND_TIMEOUT_QUEUE_URL:
            withFriendsRoundTimeoutQueue.url,
        },
        permissions: [
          appSecretPermission,
          withFriendsGameStartReceivePermission,
          withFriendsRoundTimeoutSendPermission,
        ],
      },
    );
    const withFriendsRoundTimeoutWorker = new sst.aws.Function(
      "WithFriendsRoundTimeoutWorker",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/jobs/process_with_friends_round_timeout.process_with_friends_round_timeout",
        environment: {
          ENVIRONMENT: $app.stage,
          WITH_FRIENDS_ROUND_ADVANCE_QUEUE_URL:
            withFriendsRoundAdvanceQueue.url,
        },
        permissions: [
          appSecretPermission,
          withFriendsRoundTimeoutReceivePermission,
          withFriendsRoundAdvanceSendPermission,
        ],
      },
    );
    const withFriendsRoundAdvanceWorker = new sst.aws.Function(
      "WithFriendsRoundAdvanceWorker",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/jobs/process_with_friends_round_advance.process_with_friends_round_advance",
        environment: {
          ENVIRONMENT: $app.stage,
          WITH_FRIENDS_ROUND_TIMEOUT_QUEUE_URL:
            withFriendsRoundTimeoutQueue.url,
        },
        permissions: [
          appSecretPermission,
          withFriendsRoundAdvanceReceivePermission,
          withFriendsRoundTimeoutSendPermission,
        ],
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
      "POST /api/v1/with-friends-games",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/with_friends_games/handler.create_with_friends_game",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/with-friends-games/join",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/with_friends_games/handler.join_with_friends_game",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/with-friends-games/{gameId}/start",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/with_friends_games/handler.start_with_friends_game",
        environment: {
          ENVIRONMENT: $app.stage,
          WITH_FRIENDS_GAME_START_QUEUE_URL: withFriendsGameStartQueue.url,
        },
        permissions: [appSecretPermission, withFriendsGameStartSendPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/with-friends-games/{gameId}/rounds/{roundNumber}/guesses",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/with_friends_games/handler.create_with_friends_game_guess",
        environment: {
          ENVIRONMENT: $app.stage,
          WITH_FRIENDS_ROUND_ADVANCE_QUEUE_URL:
            withFriendsRoundAdvanceQueue.url,
        },
        permissions: [
          appSecretPermission,
          withFriendsRoundAdvanceSendPermission,
        ],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "GET /api/v1/daily-challenge-games/today",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/daily_challenge_games/handler.get_today_daily_challenge",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/daily-challenge-games",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/daily_challenge_games/handler.create_daily_challenge_game",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/daily-challenge-games/{gameId}/rounds/{roundNumber}/start",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/daily_challenge_games/handler.start_daily_challenge_game_round",
        environment: { ENVIRONMENT: $app.stage },
        permissions: [appSecretPermission],
      },
      { auth: { lambda: firebaseAuthorizer.id } },
    );

    api.route(
      "POST /api/v1/daily-challenge-games/{gameId}/rounds/{roundNumber}/guesses",
      {
        architecture: "arm64",
        runtime: "python3.14",
        handler:
          "src/api/v1/daily_challenge_games/handler.create_daily_challenge_game_guess",
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
    new sst.aws.CronV2("PrepareDailyChallenge", {
      schedule: "cron(0 0 * * ? *)",
      function: createDailyChallenge,
    });
    new sst.aws.CronV2("DeleteExpiredDailyChallenges", {
      schedule: "cron(0 1 * * ? *)",
      function: cleanupDailyChallenges,
    });
    new sst.aws.CronV2("DeleteExpiredWithFriendsGames", {
      schedule: "cron(0 2 * * ? *)",
      function: cleanupWithFriendsGames,
    });
    withFriendsGameStartQueue.subscribe(withFriendsGameStartWorker);
    withFriendsRoundTimeoutQueue.subscribe(withFriendsRoundTimeoutWorker);
    withFriendsRoundAdvanceQueue.subscribe(withFriendsRoundAdvanceWorker);
  },
});
