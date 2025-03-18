import type { Post } from '~/types'
import process from 'node:process'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import { getContent, getContents } from './gh'
import { toTitleCase } from './string'

interface Blog {
  slug: string
  title: string
  categories: string[]
  pubDate: Date
  filename: string
}

function parseFilename(filename: string): Blog {
  const name = filename.replace('.md', '')
  const [timestamp, rest] = name.split('--')
  const [title, keywords] = rest.split('__')
  return {
    slug: title,
    title: toTitleCase(title.replaceAll('-', ' ')),
    categories: keywords
      ? keywords
        .split('_')
        .filter(keyword => keyword !== 'blog')
      : [],
    pubDate: parseCompactDate(timestamp),
    filename,
  }
}

function parseCompactDate(dateString: string): Date {
  // Eg, 20250219T094214
  const year = dateString.substring(0, 4)
  const month = dateString.substring(4, 6)
  const day = dateString.substring(6, 8)
  const hour = dateString.substring(9, 11)
  const minute = dateString.substring(11, 13)
  const second = dateString.substring(13, 15)
  const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}`
  return new Date(isoString)
}

interface MarkdownContent {
  frontmatter: Record<string, unknown>
  content: string
}

function processMarkdownContent(content: string): MarkdownContent {
  const { data, content: markdownContent } = matter(content)
  return { frontmatter: data, content: markdownContent }
}

function replaceLocalLinks(content: string): string {
  // replace local links with remote links
  content = content.replace(
    /\[(.*?)\]\(((?:\.\/|\.\.\/)?.*?\.md)\)/g,
    (_match, linkText, filePath) => {
      const { slug } = parseFilename(filePath)
      const url = process.env.NODE_ENV === 'development'
        ? `http://localhost:4321/posts/${slug}`
        : `https://cowboy-bebug.github.io/posts/${slug}`
      return `[${linkText}](${url})`
    },
  )

  // replace local image references with remote image URLs
  content = content.replace(
    /!\[(.*?)\]\(\.\/.\.\/assets\/([^)]+)\)/g,
    (_match, altText, imagePath) => {
      const filename = imagePath.split('/').pop()
      const imageUrl = process.env.NODE_ENV === 'development'
        ? `/assets/${filename}`
        : `https://cowboy-bebug.github.io/assets/${filename}`
      return `![${altText}](${imageUrl})`
    },
  )

  content = content.replace(
    /!\[(.*?)\]\(((?:\.\/|\.\.\/|~\/github\.com\/cowboy-bebug\/org-work\/)?assets\/[^)]+)\)/g,
    (_match, altText, imagePath) => {
      const filename = imagePath.split('/').pop()
      // Use absolute paths starting with / to avoid relative path resolution
      const imageUrl = process.env.NODE_ENV === 'development'
        ? `/assets/${filename}`
        : `https://cowboy-bebug.github.io/assets/${filename}`
      return `![${altText}](${imageUrl})`
    },
  )

  return content
}

const parser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

function renderMarkdownContent(content: string): string {
  content = replaceLocalLinks(content)
  return parser.render(content)
}

export async function getBlogs(): Promise<Post[]> {
  try {
    const contents = await getContents()
    const blogFiles = contents
      .filter(({ name, type }) => type === 'file'
        && name.includes('_blog')
        && !name.includes('_onit')
        && name.endsWith('.md'))
    const posts = await Promise.all(
      blogFiles
        .map(async (file) => {
          const fileContent = await getContent(file.download_url)
          const { frontmatter, content } = processMarkdownContent(fileContent)
          const { slug, title, categories, pubDate } = parseFilename(file.name)
          const html = renderMarkdownContent(content)
          return {
            id: slug,
            slug,
            body: content,
            rendered: { html },
            collection: 'posts',
            data: {
              title,
              pubDate,
              categories,
              ...frontmatter,
            },
          } as Post
        }),
    )
    return posts
  }
  catch (error) {
    console.error('Error fetching remote posts:', error)
    return []
  }
}
