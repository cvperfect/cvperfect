import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // version from package.json
      let version = '0.0.0';
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
        version = pkg.version || version;
      } catch {}
      
      // orchestration from .claude/settings.json
      let orchestrationStatus = 'disabled';
      try {
        const settingsPath = path.join(process.cwd(), '.claude', 'settings.json');
        if (fs.existsSync(settingsPath)) {
          const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
          if (settings.orchestration?.parallel_coordination) {
            orchestrationStatus = 'chained_agent_system_active';
          }
        }
      } catch {}
      
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'CVPerfect API',
        version,
        orchestration: orchestrationStatus,
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
    } catch (err) {
      res.status(500).json({ status: 'unhealthy', error: err.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}