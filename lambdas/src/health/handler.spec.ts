import { HealthService } from './HealthService'

describe('HealthService', () => {
  const service = new HealthService()

  it('should return healthy status', () => {
    const result = service.check()

    expect(result.status).toBe('healthy')
    expect(result.timestamp).toBeDefined()
  })
})
