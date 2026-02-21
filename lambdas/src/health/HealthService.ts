export class HealthService {
  check() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  }
}
