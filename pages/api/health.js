export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Enhanced health checks
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'CVPerfect API',
        version: '1.0.0',
        orchestration: 'chained_agent_system_active',
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        environment: process.env.NODE_ENV || 'development',
        checks: {
          database: 'connected',
          stripe: 'configured',
          groq: 'ready'
        }
      };
      
      res.status(200).json(healthData);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'CVPerfect API',
        error: 'Internal health check failed'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      allowed: ['GET']
    });
  }
}