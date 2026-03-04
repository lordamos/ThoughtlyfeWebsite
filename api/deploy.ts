import type { VercelRequest, VercelResponse } from "@vercel/node"

/**
 * POST /api/deploy
 * Body: { owner, repo, ref, name, teamId }
 *
 * Creates a new Vercel project linked to the GitHub repo and triggers a deployment.
 * Polls until READY or ERROR, then returns the live URL.
 */

const VERCEL_TOKEN = process.env.VERCEL_DEPLOY_TOKEN
const TEAM_ID = process.env.VERCEL_TEAM_ID || "team_4T7YVcgblKIVKjKDsQdMTlrK"
const BASE = "https://api.vercel.com"

async function vercelFetch(path: string, options: RequestInit = {}) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}teamId=${TEAM_ID}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `Vercel API ${res.status}: ${JSON.stringify(data)}`)
  return data
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  if (!VERCEL_TOKEN) {
    return res.status(500).json({ error: "VERCEL_DEPLOY_TOKEN not configured on server" })
  }

  const { owner, repo, ref = "main", name, description } = req.body || {}
  if (!owner || !repo) {
    return res.status(400).json({ error: "Missing owner or repo in request body" })
  }

  // Sanitise project name: lowercase, alphanumeric + hyphens, max 52 chars
  const projectName = (name || `${owner}-${repo}`)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 52)

  try {
    // ── Step 1: Check if project already exists ──────────────────────────────
    let projectId: string | null = null
    try {
      const existing = await vercelFetch(`/v9/projects/${projectName}`)
      projectId = existing.id
      console.log(`Project already exists: ${projectId}`)
    } catch {
      // Project doesn't exist — create it
    }

    if (!projectId) {
      // ── Step 2: Create a new Vercel project linked to the GitHub repo ──────
      const project = await vercelFetch("/v10/projects", {
        method: "POST",
        body: JSON.stringify({
          name: projectName,
          framework: null, // auto-detect
          gitRepository: {
            type: "github",
            repo: `${owner}/${repo}`,
          },
          publicSource: true,
        }),
      })
      projectId = project.id
      console.log(`Created project: ${projectId}`)
    }

    // ── Step 3: Create a deployment from the git source ───────────────────────
    const deployment = await vercelFetch("/v13/deployments", {
      method: "POST",
      body: JSON.stringify({
        name: projectName,
        target: "production",
        gitSource: {
          type: "github",
          org: owner,
          repo: repo,
          ref: ref,
        },
      }),
    })

    const deploymentId = deployment.id
    console.log(`Deployment created: ${deploymentId}, status: ${deployment.readyState}`)

    // ── Step 4: Poll until READY or ERROR (max 3 minutes) ────────────────────
    let status = deployment.readyState || "INITIALIZING"
    let deploymentUrl = deployment.url || null
    const maxAttempts = 36 // 36 × 5s = 3 min
    let attempts = 0

    while (
      (status === "INITIALIZING" || status === "BUILDING" || status === "QUEUED") &&
      attempts < maxAttempts
    ) {
      await sleep(5000)
      attempts++
      try {
        const check = await vercelFetch(`/v13/deployments/${deploymentId}`)
        status = check.readyState || check.status || status
        deploymentUrl = check.url || deploymentUrl
        console.log(`Poll ${attempts}: status=${status}, url=${deploymentUrl}`)
      } catch (pollErr) {
        console.warn(`Poll error at attempt ${attempts}:`, pollErr)
      }
    }

    if (status === "READY" && deploymentUrl) {
      const liveUrl = deploymentUrl.startsWith("http")
        ? deploymentUrl
        : `https://${deploymentUrl}`

      return res.status(200).json({
        success: true,
        deploymentId,
        projectId,
        projectName,
        liveUrl,
        status,
        description: description || "",
      })
    } else if (status === "ERROR" || status === "CANCELED") {
      return res.status(500).json({
        error: `Deployment ${status.toLowerCase()}. Check the Vercel dashboard for build logs.`,
        deploymentId,
        projectId,
        status,
      })
    } else {
      // Still building after timeout — return partial info so frontend can poll
      return res.status(202).json({
        success: false,
        pending: true,
        deploymentId,
        projectId,
        projectName,
        status,
        message: "Deployment is still building. Poll /api/deploy-status for updates.",
      })
    }
  } catch (err) {
    console.error("deploy error:", err)
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Deployment failed",
    })
  }
}
