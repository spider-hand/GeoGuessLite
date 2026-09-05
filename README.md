<p align="center"> <img src="./client/public/apple-touch-icon.png" width="120" /> </p> <h1 align="center">GeoGuessLite</h1> <p align="center"> <em>Lightweight, subscription-free Geoguessr experience</em> </p><p align="center"> <strong><a href="https://geoguesslite.com" target="_blank">geoguesslite.com</a></strong> </p>

## Setup

- [Client](./client/README.md)
- [Server](./server/README.md)

If you want to start the development environment from the repository root:

```sh
export AWS_PROFILE=<your-profile>
```

Then

```sh
pnpm dev
```

This starts:

- Frontend development server
- SST local development environment

Refer to the server setup guide for AWS SSO authentication and profile configuration.

## Tech Stack

- Frontend: Vue
- Backend: AWS Lambda
- Authentication: Firebase Authentication
- DB: Firebase Realtime Database, PostgreSQL
- Message Queue: AWS SQS
- Hosting: Cloudflare
- Infrastructure: SST

## Credits

- Flag images are downloaded from [Flagpedia](https://flagpedia.net/).
- Featured by [Mapillary](https://www.mapillary.com/) as a community project.

<p align="center">
  <img src="./docs/assets/mapillary-logo.png" alt="Mapillary" width="360" />
</p>

## Contribution

- Bug fix PRs are always appreciated.
- UI changes or new features should not be submitted without prior discussion. Please open an issue first to propose and discuss them.

Thanks for your understanding and contributions.

## License

[MIT](./LICENSE)

Copyright (c) 2025-present, Akinori Hoshina
