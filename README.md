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
├── lambdas/
│   └── src/
│       ├── health/                     # Example lambda
│       │   ├── handler.ts              # Entry point
│       │   ├── HealthService.ts        # Business logic class
│       │   └── handler.spec.ts         # Unit test
│       ├── common/                     # Constants, enums
│       ├── errors/                     # ApiError, ValidationError, AuthorizationError
│       └── utils/
│           ├── response.ts             # setResponse, setErrorResponse
│           └── request.ts              # hasBody, hasAuthorizationHeader
├── config/
│   └── routes.json                     # Single source of truth for all routes
├── scripts/
│   ├── dev.sh                          # Dev startup (SAM + ngrok + file watcher)
│   ├── sam-start.sh                    # SAM build and start
│   └── generate-sam-template.ts        # Generates template.local.yaml from routes.json
└── test/stacks/                        # CDK stack tests
```

## Prerequisites

Install the following before starting:

1. **Node.js 20+**

2. **Docker** (without Docker Desktop for WSL2)
   ```bash
   # Follow: https://nickjanetakis.com/blog/install-docker-in-wsl-2-without-docker-desktop
   # Verify:
   docker info
   ```

3. **AWS SAM CLI**
   ```bash
   pip install aws-sam-cli
   # Verify:
   sam --version
   ```

4. **ngrok**
   ```bash
   curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok-v3-stable-linux-amd64.tgz | sudo tar xz -C /usr/local/bin
   # Verify:
   ngrok version
   ```

5. **AWS CDK CLI**
   ```bash
   npm install -g aws-cdk
   ```

## Setup

```bash
# Install dependencies
npm install

# Copy and fill in your environment variables
cp .env.example .env
```

`.env` requires:

```
CDK_DEFAULT_ACCOUNT=your-aws-account-id
CDK_DEFAULT_REGION=ap-southeast-1
NGROK_AUTHTOKEN=your-ngrok-auth-token
```

Set your ngrok auth token (one-time):

```bash
ngrok config add-authtoken your-ngrok-auth-token
```

## Local Development

```bash
npm run dev
```

This will:
1. Generate `template.local.yaml` from `config/routes.json`
2. Build and start SAM (API Gateway + Lambda in Docker) on `http://localhost:3000`
3. Start ngrok tunnel for a public URL
4. Watch `lambdas/src/` and `config/routes.json` for changes — auto-rebuilds on save

Output:

```
Rebuilding...
Starting API...
Mounting Health at http://127.0.0.1:3000/api/health [GET]
 * Running on http://127.0.0.1:3000

Local:  http://127.0.0.1:3000
Public: https://your-subdomain.ngrok-free.dev

Ready.
```

All routes are prefixed with `/api`:

```bash
curl http://localhost:3000/api/health
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with auto-restart + ngrok |
| `npm test` | Run CDK infrastructure tests |
| `npm run test:unit` | Run lambda unit tests |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run prettier` | Check formatting |
| `npm run prettier:fix` | Fix formatting |
| `npm run generate:sam` | Regenerate template.local.yaml from routes.json |
| `npx cdk deploy --all` | Deploy all stacks to AWS |
| `npx cdk diff` | Preview changes before deploying |
| `npx cdk synth` | Generate CloudFormation templates |

## Adding a New Lambda

### 1. Create the lambda folder

```
lambdas/src/users/
├── handler.ts          # Entry point
├── UserService.ts      # Business logic class
└── handler.spec.ts     # Unit test
```

**UserService.ts**

```ts
export class UserService {
  async getAll() {
    return [{ id: '1', name: 'John' }]
  }
}
```

**handler.ts**

```ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { setResponse, setErrorResponse } from '../utils/response'
import { UserService } from './UserService'

const userService = new UserService()

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const users = await userService.getAll()
    return setResponse(200, users)
  } catch (error) {
    return setErrorResponse(error, 'users.handler')
  }
}
```

**handler.spec.ts**

```ts
import { UserService } from './UserService'

describe('UserService', () => {
  const service = new UserService()

  it('should return users', async () => {
    const result = await service.getAll()
    expect(result).toBeDefined()
  })
})
```

### 2. Add to config/routes.json

```json
[
  { "lambda": "health", "path": "/health", "method": "GET" },
  { "lambda": "users", "path": "/users", "method": "GET" }
]
```

`routes.json` is the single source of truth. It automatically drives:
- **LambdaStack** — creates the Lambda function
- **ApiStack** — creates the API Gateway route under `/api`
- **template.local.yaml** — SAM template for local dev

### 3. Done

If `npm run dev` is running, it will auto-detect the change and rebuild. Otherwise:

```bash
npm run dev
# then: curl http://localhost:3000/api/users
```

### 4. Deploy

```bash
npx cdk diff         # preview
npx cdk deploy --all # deploy
```

## Lambda Pattern

Each lambda follows **handler + service + test**:

| File | Purpose |
|---|---|
| `handler.ts` | Entry point — wires service to Lambda event |
| `{Name}Service.ts` | Business logic class, reusable across lambdas |
| `handler.spec.ts` | Unit test for the service |

Services can be imported by other lambdas:

```ts
import { UserService } from '../users/UserService'
```

## Error Handling

```ts
import { ValidationError, AuthorizationError, ApiError } from '../errors'

throw new ValidationError('Invalid input')    // 400
throw new AuthorizationError()                // 403
throw new ApiError('Something broke', 502)    // custom status
```

`setErrorResponse` catches these and returns the correct status code + JSON body.

## Response Helpers

```ts
import { setResponse } from '../utils/response'

setResponse(200, { data: 'ok' })
setResponse(201, { id: '123' })
```

## Request Helpers

```ts
import { hasBody, hasAuthorizationHeader } from '../utils/request'

if (!hasBody(event)) throw new ValidationError('Missing body')
if (!hasAuthorizationHeader(event)) throw new AuthorizationError()
```
