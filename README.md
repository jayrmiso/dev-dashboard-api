# Dev Dashboard API

AWS CDK + Lambda serverless API with local development powered by SAM CLI + ngrok.

## Project Structure

```
├── bin/App.ts                          # CDK app entry point
├── lib/
│   ├── stacks/
│   │   ├── ApiStack.ts                 # API Gateway routes (reads routes.json)
│   │   └── LambdaStack.ts             # Lambda functions (reads routes.json)
│   └── constructs/
│       └── LambdaFunction.ts           # Reusable Lambda construct
├── lambdas/src/                        # Lambda handlers and services
├── config/routes.json                  # Single source of truth for all routes
├── scripts/                            # Dev and codegen scripts
└── test/stacks/                        # CDK stack tests
```

## Prerequisites

- Node.js 20+
- Docker (for SAM local)
- AWS SAM CLI
- ngrok
- AWS CDK CLI (`npm install -g aws-cdk`)

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your values.

## Commands

| Command                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start local dev server with auto-restart + ngrok |
| `npm test`             | Run CDK infrastructure tests                     |
| `npm run test:unit`    | Run lambda unit tests                            |
| `npm run lint`         | Run ESLint                                       |
| `npm run lint:fix`     | Run ESLint with auto-fix                         |
| `npm run prettier`     | Check formatting                                 |
| `npm run prettier:fix` | Fix formatting                                   |
| `npx cdk deploy --all` | Deploy all stacks to AWS                         |
| `npx cdk diff`         | Preview changes before deploying                 |

## Adding a New Lambda

1. Create a folder under `lambdas/src/<name>/` with `handler.ts`, `<Name>Service.ts`, and `handler.spec.ts`
2. Add the route to `config/routes.json`
3. That's it — CDK, SAM, and API Gateway all read from `routes.json`
