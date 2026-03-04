import type { VercelRequest, VercelResponse } from "@vercel/node"

/**
 * GET /api/github-repo?url=https://github.com/owner/repo
 *
 * Fetches public metadata for a GitHub repository using the GitHub API.
 * Returns: name, description, topics, language, defaultBranch, owner, repo
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { url } = req.query
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url query parameter" })
  }

  // Parse GitHub URL — accept both https://github.com/owner/repo and owner/repo
  let owner: string, repo: string
  try {
    const cleaned = url.trim().replace(/\.git$/, "")
    const match =
      cleaned.match(/github\.com\/([^/]+)\/([^/]+)/) ||
      cleaned.match(/^([^/]+)\/([^/]+)$/)
    if (!match) throw new Error("Invalid GitHub URL")
    owner = match[1]
    repo = match[2]
  } catch {
    return res.status(400).json({ error: "Could not parse GitHub URL. Use format: https://github.com/owner/repo" })
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "SGA-Import/1.0",
  }

  // Use GitHub token if available (higher rate limits)
  const ghToken = process.env.GITHUB_TOKEN
  if (ghToken) headers["Authorization"] = `Bearer ${ghToken}`

  try {
    const [repoRes, topicsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/topics`, { headers }),
    ])

    if (!repoRes.ok) {
      const err = await repoRes.json().catch(() => ({}))
      return res.status(repoRes.status).json({
        error: err.message || `GitHub API error: ${repoRes.status}`,
      })
    }

    const repoData = await repoRes.json()
    const topicsData = topicsRes.ok ? await topicsRes.json() : { names: [] }

    return res.status(200).json({
      owner,
      repo,
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description || "",
      defaultBranch: repoData.default_branch || "main",
      language: repoData.language || null,
      topics: topicsData.names || [],
      stars: repoData.stargazers_count,
      isPrivate: repoData.private,
      homepage: repoData.homepage || null,
      htmlUrl: repoData.html_url,
    })
  } catch (err) {
    console.error("github-repo error:", err)
    return res.status(500).json({ error: "Failed to fetch GitHub repo metadata" })
  }
}
