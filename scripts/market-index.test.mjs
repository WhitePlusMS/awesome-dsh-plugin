import assert from 'node:assert/strict'
import test from 'node:test'
import { buildMarketIndex } from './lib/market-index.mjs'

const first = { url: 'https://github.com/example/first', name: 'example/first', category: 'tools' }
const second = { url: 'https://github.com/example/second', name: 'example/second', category: 'tools' }
const locales = [{ code: 'en', categories: { tools: 'Tools' } }]
const record = { npm: 'example-plugin', version: '1.0.0', publishedAt: 1 }

test('a duplicate package name does not prevent the index from being built', () => {
  const result = buildMarketIndex({
    entries: [first, second],
    npmMap: { [first.url]: record, [second.url]: record },
    locales,
  })
  assert.equal(result.index.plugins.length, 1)
  assert.equal(result.index.plugins[0].name, 'example-plugin')
  assert.equal(result.skipped.refused, 1)
  assert.match(result.refused[0], /duplicate.*example-plugin/i)
})

test('an invalid entry does not prevent a later valid entry with the same name', () => {
  const result = buildMarketIndex({
    entries: [first, second],
    npmMap: { [first.url]: { ...record, version: 'invalid' }, [second.url]: record },
    locales,
  })
  assert.equal(result.index.plugins.length, 1)
  assert.equal(result.index.plugins[0].title, second.name)
  assert.equal(result.skipped.refused, 1)
})
