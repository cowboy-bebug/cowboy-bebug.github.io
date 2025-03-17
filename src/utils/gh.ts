const requestInit: RequestInit = {
  headers: {
    Authorization: `token ${import.meta.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
}

interface Content {
  name: string
  path: string
  url: string
  download_url: string
  type: string
}

export async function getContents(): Promise<Content[]> {
  const response = await fetch('https://api.github.com/repos/cowboy-bebug/org-work/contents/notes/', requestInit)
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function getContent(downloadUrl: string): Promise<string> {
  const response = await fetch(downloadUrl, requestInit)
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }
  return response.text()
}
