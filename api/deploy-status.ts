import type { VercelRequest, VercelResponse } from "@vercel/node"

/**
 * GET /api/deploy-status?deploymentId=dpl_xxx
 *
 * Returns the current status and URL of a Vercel deployment.
 */

const VERCEL_TOKEN = process.env.VERCEL_DEPLOY_TOKEN
const TEAM_ID = process.env.VERCEL_TEAM_ID || "team_4T7YVcgblKIVKjKDsQdMTlrK"
const BASE = "https://api.vercel.com"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  if (!VERCEL_TOKEN) {
    return res.status(500).json({ error: "VERCEL_DEPLOY_TOKEN not configured" })
  }

  const { deploymentId } = req.query
  if (!deploymentId || typeof deploymentId !== "string") {
    return res.status(400).json({ error: "Missing deploymentId" })
  }

  try {
    const url = `${BASE}/v13/deployments/${deploymentId}?teamId=${TEAM_ID}`
    const apiRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    const data = await apiRes.json()
    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: data.error?.message || "Vercel API error" })
    }

    const status = data.readyState || data.status
    const deploymentUrl = data.url
      ? data.url.startsWith("http")
        ? data.url
        : `https://${data.url}`
      : null

    return res.status(200).json({
      deploymentId,
      status,
      liveUrl: deploymentUrl,
      ready: status === "READY",
      error: status === "ERROR" || status === "CANCELED",
    })
  } catch (err) {
    console.error("deploy-status error:", err)
    return res.status(500).json({ error: "Failed to fetch deployment status" })
  }
}
