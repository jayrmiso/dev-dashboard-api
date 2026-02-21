export function hasBody(event: { body?: string | null }): boolean {
  return event.body !== null && event.body !== undefined && event.body.length > 0
}

export function hasAuthorizationHeader(event: {
  headers?: Record<string, string | undefined>
}): boolean {
  return !!event.headers?.Authorization || !!event.headers?.authorization
}
