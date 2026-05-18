import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'

// Sidebar config derived from _meta.en-US.json
const docsSidebar = [
  { label: 'Getting Started', link: '/docs/getting-started' },
  { label: 'API', link: '/docs/api' },
  { label: 'Global Configuration', link: '/docs/global-configuration' },
  { label: 'Data Fetching', link: '/docs/data-fetching' },
  { label: 'Auto Revalidation', link: '/docs/revalidation' },
  { label: 'Arguments', link: '/docs/arguments' },
  { label: 'Mutation & Revalidation', link: '/docs/mutation' },
  { label: 'Error Handling', link: '/docs/error-handling' },
  { label: 'Conditional Data Fetching', link: '/docs/conditional-fetching' },
  { label: 'Pagination', link: '/docs/pagination' },
  { label: 'Subscription', link: '/docs/subscription' },
  { label: 'Prefetching', link: '/docs/prefetching' },
  { label: 'Next.js SSG and SSR', link: '/docs/with-nextjs' },
  { label: 'TypeScript', link: '/docs/typescript' },
  { label: 'Suspense', link: '/docs/suspense' },
  { label: 'Middleware', link: '/docs/middleware' },
  {
    label: 'Advanced',
    items: [
      { label: 'Performance', link: '/docs/advanced/performance' },
      { label: 'Caching', link: '/docs/advanced/cache' },
      { label: 'React Native', link: '/docs/advanced/react-native' },
      { label: 'Understanding', link: '/docs/advanced/understanding' },
      { label: 'Accessibility', link: '/docs/advanced/accessibility' },
    ],
  },
  {
    label: 'Change Log',
    link: 'https://github.com/cite-graph/openhuman/releases',
    attrs: { target: '_blank', rel: 'noopener' },
  },
]

export default defineConfig({
  output: 'static',
  integrations: [
    react(),
    starlight({
      title: 'OpenHuman',
      description: 'OpenHuman is a OpenHuman Hooks library for data fetching.',
      logo: {
        src: './public/favicon/favicon.svg',
      },
      social: {
        github: 'https://github.com/cite-graph/openhuman',
      },
      editLink: {
        baseUrl: 'https://github.com/cite-graph/openhuman-site/blob/main/docs-cf/',
      },
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en-US',
        },
        'zh-CN': {
          label: '简体中文',
          lang: 'zh-CN',
        },
        'es-ES': {
          label: 'Español',
          lang: 'es-ES',
        },
        'fr-FR': {
          label: 'Français',
          lang: 'fr-FR',
        },
        'pt-BR': {
          label: 'Português Brasileiro',
          lang: 'pt-BR',
        },
        ja: {
          label: '日本語',
          lang: 'ja',
        },
        ko: {
          label: '한국어',
          lang: 'ko',
        },
        ru: {
          label: 'Русский',
          lang: 'ru',
        },
      },
      sidebar: [
        {
          label: 'Docs',
          items: docsSidebar,
          translations: {
            'zh-CN': 'Docs',
            'es-ES': 'Docs',
            'fr-FR': 'Docs',
            'pt-BR': 'Docs',
            ja: 'Docs',
            ko: 'Docs',
            ru: 'Docs',
          },
        },
        {
          label: 'Blog',
          link: '/blog',
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
    mdx(),
  ],
})
