import * as fs from 'fs'
import * as path from 'path'

type Route = {
  lambda: string
  path: string
  method: string
}

const routes: Route[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../config/routes.json'), 'utf-8')
)

const toPascalCase = (str: string): string =>
  str
    .split(/[-/]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')

const items = routes.map((route) => {
  const segments = route.path.split('/').filter(Boolean)

  return {
    name: `${route.method} ${toPascalCase(route.lambda)}`,
    request: {
      method: route.method.toUpperCase(),
      header: [
        {
          key: 'Content-Type',
          value: 'application/json'
        }
      ],
      url: {
        raw: `{{baseUrl}}/api${route.path}`,
        host: ['{{baseUrl}}'],
        path: ['api', ...segments]
      },
      ...(route.method.toUpperCase() !== 'GET' &&
        route.method.toUpperCase() !== 'DELETE' && {
          body: {
            mode: 'raw',
            raw: '{}',
            options: { raw: { language: 'json' } }
          }
        })
    }
  }
})

const collection = {
  info: {
    name: 'Dev Dashboard API',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    {
      key: 'baseUrl',
      value: 'http://localhost:3000'
    }
  ],
  item: items
}

const outPath = path.resolve(
  __dirname,
  '../outputs/postman/dev-dashboard-api.postman_collection.json'
)
fs.writeFileSync(outPath, JSON.stringify(collection, null, 2))
console.log(`Generated ${outPath} with ${routes.length} route(s)`)
