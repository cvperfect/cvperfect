export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CVPerfect API',
      orchestration: 'chained_agent_system_active'
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}