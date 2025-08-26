// Simple ping endpoint for health checks and API availability
export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Set appropriate headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-cache");
  
  // Return pong response
  return res.status(200).json({ pong: true });
}
