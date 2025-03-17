import type { UserConfig } from '~/types'

export const userConfig: Partial<UserConfig> = {
  site: {
    title: '攻殻機動隊',
    subtitle: 'Cowboy Bebug',
    author: 'Cowboy Bebug',
    description: 'ネットは広大だわ。',
    website: 'https://cowboy-bebug.github.io/',
    pageSize: 5,
    socialLinks: [
      {
        name: 'github',
        href: 'https://github.com/cowboy-bebug',
      },
    ],
    navLinks: [
      {
        name: 'Posts',
        href: '/',
      },
      {
        name: 'Categories',
        href: '/categories',
      },
    ],
    footer: [
      '© %year <a target="_blank" href="%website">%author</a>',
    ],
  },
  appearance: {
    theme: 'system',
    locale: 'en-us',
  },
}
