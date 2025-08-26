export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      allowed: ['POST']
    });
  }

  try {
    const { format, paymentStatus, plan } = req.body;

    // Validate required fields
    if (!format || !paymentStatus || !plan) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['format', 'paymentStatus', 'plan']
      });
    }

    // Payment gate check - must be completed
    if (paymentStatus !== 'completed') {
      return res.status(402).json({
        error: 'PAYMENT_REQUIRED',
        message: 'Export blocked: Payment required for this feature',
        suggestedAction: 'Complete payment to access export functionality'
      });
    }

    // Plan-based format access control
    const allowedFormats = {
      basic: ['pdf'],
      gold: ['pdf', 'docx'],
      premium: ['pdf', 'docx', 'html', 'json']
    };

    if (!allowedFormats[plan]) {
      return res.status(400).json({
        error: 'INVALID_PLAN',
        message: `Plan '${plan}' is not valid`,
        validPlans: Object.keys(allowedFormats)
      });
    }

    if (!allowedFormats[plan].includes(format)) {
      return res.status(403).json({
        error: 'PLAN_UPGRADE_REQUIRED',
        message: `Format '${format}' not available in '${plan}' plan`,
        availableFormats: allowedFormats[plan],
        requiredPlan: format === 'html' || format === 'json' ? 'premium' : 
                     format === 'docx' ? 'gold' : 'basic'
      });
    }

    // Export allowed - generate file
    const timestamp = Date.now();
    const fileName = `cv-${timestamp}.${format}`;
    
    res.status(200).json({
      ok: true,
      file: fileName,
      format: format,
      plan: plan,
      exportedAt: new Date().toISOString(),
      size: Math.floor(Math.random() * 1000000) + 100000 // Simulate file size
    });

  } catch (error) {
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Export processing failed',
      details: error.message
    });
  }
}