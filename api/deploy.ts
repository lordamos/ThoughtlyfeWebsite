import type { VercelRequest, VercelResponse } from "@vercel/node"
import * as https from "https"
import * as http from "http"
import * as zlib from "zlib"

/**
 * POST /api/deploy
 * Body: { owner, repo, ref?, name?, description? }
 *
 * Strategy: Download the GitHub repo as a tarball, extract it, upload all files
 * to Vercel via the Files API, then create a deployment. This works for ANY
 * public GitHub repo without requiring the Vercel GitHub App to be installed.
 */

const VERCEL_TOKEN = process.env.VERCEL_DEPLOY_TOKEN
const TEAM_ID = process.env.VERCEL_TEAM_ID || "team_lRPH6liIuW9IKydiDcpUPd6B"
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

// Follow redirects and return a Buffer
function fetchBuffer(url: string, redirects = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http
    proto.get(url, { headers: { "User-Agent": "SGA-Deployer/1.0" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirects <= 0) return reject(new Error("Too many redirects"))
        return resolve(fetchBuffer(res.headers.location, redirects - 1))
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`))
      }
      const chunks: Buffer[] = []
      res.on("data", (c: Buffer) => chunks.push(c))
      res.on("end", () => resolve(Buffer.concat(chunks)))
      res.on("error", reject)
    }).on("error", reject)
  })
}

// Simple tar reader — extracts files from a .tar.gz buffer
// Returns array of { path, data } for non-directory entries
function extractTar(tarBuffer: Buffer): Array<{ path: string; data: Buffer }> {
  const files: Array<{ path: string; data: Buffer }> = []
  let offset = 0

  while (offset + 512 <= tarBuffer.length) {
    const header = tarBuffer.slice(offset, offset + 512)
    // Check for end-of-archive (two 512-byte zero blocks)
    if (header.every((b) => b === 0)) break

    const nameRaw = header.slice(0, 100).toString("utf8").replace(/\0/g, "")
    const prefixRaw = header.slice(345, 500).toString("utf8").replace(/\0/g, "")
    const fullName = prefixRaw ? `${prefixRaw}/${nameRaw}` : nameRaw
    const sizeOctal = header.slice(124, 136).toString("utf8").replace(/\0/g, "").trim()
    const size = parseInt(sizeOctal, 8) || 0
    const typeFlag = header.slice(156, 157).toString("utf8")

    offset += 512

    if (typeFlag === "0" || typeFlag === "" || typeFlag === "\0") {
      // Regular file
      const data = tarBuffer.slice(offset, offset + size)
      // Strip the leading directory component (GitHub adds reponame-sha/)
      const parts = fullName.split("/")
      const relativePath = parts.slice(1).join("/")
      if (relativePath && !relativePath.endsWith("/")) {
        files.push({ path: relativePath, data })
      }
    }

    // Advance past file data (padded to 512-byte boundary)
    offset += Math.ceil(size / 512) * 512
  }

  return files
}

// Upload a single file to Vercel Files API, return sha
async function uploadFile(fileData: Buffer, mimeType = "application/octet-stream"): Promise<string> {
  const url = `${BASE}/v2/files?teamId=${TEAM_ID}`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": mimeType,
      "x-vercel-digest": await sha1hex(fileData),
      "Content-Length": String(fileData.length),
    },
    body: fileData,
  })
  if (res.status === 200 || res.status === 409) {
    // 409 = already uploaded (same digest) — that's fine
    return sha1hex(fileData)
  }
  const text = await res.text()
  throw new Error(`File upload failed ${res.status}: ${text.slice(0, 200)}`)
}

async function sha1hex(data: Buffer): Promise<string> {
  const { createHash } = await import("crypto")
  return createHash("sha1").update(data).digest("hex")
}

function getMimeType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || ""
  const map: Record<string, string> = {
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    mjs: "application/javascript",
    ts: "application/typescript",
    tsx: "application/typescript",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    webp: "image/webp",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    md: "text/markdown",
    txt: "text/plain",
    xml: "application/xml",
    yaml: "application/yaml",
    yml: "application/yaml",
  }
  return map[ext] || "application/octet-stream"
}

// Files to skip (too large, binary blobs, etc.)
const SKIP_PATTERNS = [
  /node_modules\//,
  /\.git\//,
  /\.next\//,
  /dist\//,
  /build\//,
  /\.vercel\//,
  /\.(png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|otf|mp4|mp3|wav|zip|tar|gz|pdf)$/i,
]

function shouldSkip(path: string): boolean {
  return SKIP_PATTERNS.some((p) => p.test(path))
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

  const projectName = (name || `${owner}-${repo}`)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 52)

  try {
    // ── Step 1: Download the repo tarball from GitHub ─────────────────────────
    const tarUrl = `https://api.github.com/repos/${owner}/${repo}/tarball/${ref}`
    console.log(`Downloading tarball: ${tarUrl}`)
    const tarGzBuffer = await fetchBuffer(tarUrl)

    // ── Step 2: Decompress gzip ───────────────────────────────────────────────
    const tarBuffer = await new Promise<Buffer>((resolve, reject) => {
      zlib.gunzip(tarGzBuffer, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })

    // ── Step 3: Extract files from tar ────────────────────────────────────────
    const allFiles = extractTar(tarBuffer)
    const files = allFiles.filter((f) => f.path && !shouldSkip(f.path) && f.data.length < 5_000_000)
    console.log(`Extracted ${allFiles.length} files, uploading ${files.length} (skipped ${allFiles.length - files.length})`)

    if (files.length === 0) {
      return res.status(400).json({ error: "No deployable files found in the repository." })
    }

    // ── Step 4: Upload all files to Vercel ────────────────────────────────────
    const fileManifest: Array<{ file: string; sha: string; size: number }> = []
    for (const f of files) {
      const sha = await uploadFile(f.data, getMimeType(f.path))
      fileManifest.push({ file: f.path, sha, size: f.data.length })
    }
    console.log(`Uploaded ${fileManifest.length} files`)

    // ── Step 5: Create the Vercel deployment ──────────────────────────────────
    const deployPayload: Record<string, unknown> = {
      name: projectName,
      target: "production",
      files: fileManifest,
      projectSettings: {
        framework: null,
      },
    }

    const deployment = await vercelFetch("/v13/deployments", {
      method: "POST",
      body: JSON.stringify(deployPayload),
    })

    const deploymentId = deployment.id
    let status = deployment.readyState || "INITIALIZING"
    let deploymentUrl = deployment.url || null
    console.log(`Deployment created: ${deploymentId}, status: ${status}`)

    // ── Step 6: Poll until READY or ERROR (max 3 minutes) ────────────────────
    const maxAttempts = 36
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
        console.log(`Poll ${attempts}: status=${status}`)
      } catch (pollErr) {
        console.warn(`Poll error at attempt ${attempts}:`, pollErr)
      }
    }

    if (status === "READY" && deploymentUrl) {
      const liveUrl = deploymentUrl.startsWith("http") ? deploymentUrl : `https://${deploymentUrl}`
      return res.status(200).json({
        success: true,
        deploymentId,
        projectName,
        liveUrl,
        status,
        description: description || "",
      })
    } else if (status === "ERROR" || status === "CANCELED") {
      return res.status(500).json({
        error: `Deployment ${status.toLowerCase()}. Check the Vercel dashboard for build logs.`,
        deploymentId,
        status,
      })
    } else {
      return res.status(202).json({
        success: false,
        pending: true,
        deploymentId,
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
