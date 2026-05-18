#!/usr/bin/env node
/**
 * Migrates Nextra MDX content to Astro Starlight format.
 *
 * Input:  docs/pages/{slug}.{locale}.mdx
 * Output: docs-cf/src/content/docs/{locale}/{slug}.mdx
 *         (root locale en-US goes directly into docs-cf/src/content/docs/)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_PAGES = path.resolve(__dirname, '../docs/pages')
const DEST_DOCS = path.resolve(__dirname, 'src/content/docs')

const ROOT_LOCALE = 'en-US'
const LOCALES = ['en-US', 'zh-CN', 'es-ES', 'fr-FR', 'pt-BR', 'ja', 'ko', 'ru']

// Map locale to Starlight content directory (root locale has no prefix)
function localeDir(locale) {
  return locale === ROOT_LOCALE ? '' : locale
}

/**
 * Transform MDX content:
 * 1. Replace nextra-theme-docs imports with @astrojs/starlight/components
 * 2. Replace <Callout> with <Aside>
 * 3. Replace <Tabs items={[...]}>/<Tab> with <Tabs>/<TabItem label="...">
 * 4. Remove next/link import, replace <Link href> with <a href>
 * 5. Remove <Bleed> wrapper (keep children)
 */
function transformMdx(content) {
  let out = content

  // --- Imports ---

  // Collect nextra component names from import
  const nextraImportRe = /import\s*\{([^}]+)\}\s*from\s*['"]nextra-theme-docs['"]\s*\n?/g
  const nextraComponents = new Set()
  let match
  while ((match = nextraImportRe.exec(content)) !== null) {
    match[1].split(',').forEach(c => nextraComponents.add(c.trim()))
  }

  // Remove all nextra-theme-docs imports
  out = out.replace(/import\s*\{[^}]+\}\s*from\s*['"]nextra-theme-docs['"]\s*\n?/g, '')

  // Remove next/link import
  out = out.replace(/import\s+\w+\s+from\s*['"]next\/link['"]\s*\n?/g, '')

  // Build replacement import for Starlight components
  const starlightNeeded = []
  if (nextraComponents.has('Callout')) starlightNeeded.push('Aside')
  if (nextraComponents.has('Tabs')) starlightNeeded.push('Tabs')
  if (nextraComponents.has('Tab')) starlightNeeded.push('TabItem')

  if (starlightNeeded.length > 0) {
    // Insert after frontmatter (if any) or at top
    const starlightImport = `import { ${starlightNeeded.join(', ')} } from '@astrojs/starlight/components'\n`
    if (out.startsWith('---')) {
      // After closing ---
      out = out.replace(/^(---[\s\S]*?---\n)/, `$1${starlightImport}`)
    } else {
      out = starlightImport + out
    }
  }

  // --- Component transformations ---

  // <Callout emoji="..."> → <Aside type="note"> (or tip/caution/danger based on emoji)
  out = out.replace(/<Callout\s+emoji="([^"]*)">/g, (_, emoji) => {
    let type = 'note'
    if (['⚠️', '🚨', '❗'].includes(emoji)) type = 'caution'
    else if (['💡', '✅', '🎉'].includes(emoji)) type = 'tip'
    return `<Aside type="${type}">`
  })
  out = out.replace(/<Callout>/g, '<Aside type="note">')
  out = out.replace(/<\/Callout>/g, '</Aside>')

  // <Tabs items={['Tab1', 'Tab2', 'Tab3']}> ... <Tab>...</Tab> ...
  // → <Tabs> ... <TabItem label="Tab1">...</TabItem> ...
  // This is the complex one: we need to pair items array with Tab children
  out = transformTabs(out)

  // <Bleed> → remove wrapper, keep children
  out = out.replace(/<Bleed>/g, '<div class="bleed">')
  out = out.replace(/<\/Bleed>/g, '</div>')

  // <Link href="..."> → <a href="...">
  out = out.replace(/<Link\s+href="([^"]+)">/g, '<a href="$1">')
  out = out.replace(/<\/Link>/g, '</a>')

  // Fix 'components/...' imports to use '/src/components/...'
  out = out.replace(/from\s*['"]components\//g, "from '/src/components/")

  return out
}

/**
 * Transform Nextra Tabs/Tab to Starlight Tabs/TabItem.
 * Nextra: <Tabs items={['pnpm', 'npm', 'yarn']}> <Tab>...</Tab> <Tab>...</Tab> </Tabs>
 * Starlight: <Tabs> <TabItem label="pnpm">...</TabItem> <TabItem label="npm">...</TabItem> </Tabs>
 */
function transformTabs(content) {
  // Match <Tabs items={[...]}> blocks
  return content.replace(/<Tabs\s+items=\{(\[[^\]]*\])\}>/g, (_, itemsExpr) => {
    // Parse items array: ['pnpm', 'npm', 'yarn']
    const items = []
    const itemRe = /['"]([^'"]+)['"]/g
    let m
    while ((m = itemRe.exec(itemsExpr)) !== null) {
      items.push(m[1])
    }

    // Replace with an opening <Tabs> and store items for Tab replacement
    // We use a temp marker with items embedded
    return `<Tabs data-items="${items.join('|')}">`
  })
}

// Second pass: replace <Tab> with <TabItem label="..."> using stored items
function transformTabItems(content) {
  // Process each Tabs block
  return content.replace(
    /<Tabs data-items="([^"]*)">([\s\S]*?)<\/Tabs>/g,
    (_, itemsStr, inner) => {
      const items = itemsStr.split('|')
      let itemIndex = 0
      const transformedInner = inner.replace(/<Tab>/g, () => {
        const label = items[itemIndex++] || `Tab ${itemIndex}`
        return `<TabItem label="${label}">`
      })
      const finalInner = transformedInner.replace(/<\/Tab>/g, '</TabItem>')
      return `<Tabs>\n${finalInner}\n</Tabs>`
    }
  )
}

function processFile(srcFile, destFile) {
  const raw = fs.readFileSync(srcFile, 'utf8')
  let transformed = transformMdx(raw)
  transformed = transformTabItems(transformed)
  fs.mkdirSync(path.dirname(destFile), { recursive: true })
  fs.writeFileSync(destFile, transformed, 'utf8')
}

/**
 * Parse filename like "getting-started.en-US.mdx" → { slug: "getting-started", locale: "en-US" }
 * or "getting-started.zh-CN.mdx" → { slug: "getting-started", locale: "zh-CN" }
 */
function parseFilename(filename) {
  const base = path.basename(filename, '.mdx')
  for (const locale of LOCALES) {
    if (base.endsWith(`.${locale}`)) {
      return { slug: base.slice(0, -(locale.length + 1)), locale }
    }
  }
  // Single-segment locales like .ja, .ko, .ru
  const shortLocales = ['ja', 'ko', 'ru']
  for (const locale of shortLocales) {
    if (base.endsWith(`.${locale}`)) {
      return { slug: base.slice(0, -(locale.length + 1)), locale }
    }
  }
  return null
}

function migrateDirectory(srcDir, destRelDir = '') {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true })
  let count = 0

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== '_meta*') {
      count += migrateDirectory(srcPath, path.join(destRelDir, entry.name))
      continue
    }
    if (!entry.name.endsWith('.mdx')) continue

    const parsed = parseFilename(entry.name)
    if (!parsed) {
      console.warn(`  Skipping (no locale): ${srcPath}`)
      continue
    }

    const { slug, locale } = parsed
    const lDir = localeDir(locale)
    const destDir = lDir
      ? path.join(DEST_DOCS, lDir, destRelDir)
      : path.join(DEST_DOCS, destRelDir)
    const destFile = path.join(destDir, `${slug}.mdx`)

    processFile(srcPath, destFile)
    count++
    console.log(`  ${locale} ${path.join(destRelDir, slug)}.mdx`)
  }
  return count
}

console.log('Migrating MDX content...\n')
const total = migrateDirectory(SRC_PAGES)
console.log(`\nDone! Migrated ${total} files.`)
