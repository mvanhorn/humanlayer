import { afterEach, describe, expect, test, vi } from 'vitest'

import {
	artifactDownloadFileName,
	artifactDownloadMimeType,
	canDownloadArtifact,
	downloadArtifactFile,
} from './download-artifact'

describe('artifactDownloadFileName', () => {
	test('uses artifact when the name is missing or blank', () => {
		expect(artifactDownloadFileName(undefined)).toBe('artifact')
		expect(artifactDownloadFileName(null)).toBe('artifact')
		expect(artifactDownloadFileName('   ')).toBe('artifact')
	})

	test('keeps a simple file name', () => {
		expect(artifactDownloadFileName('plan.md')).toBe('plan.md')
	})

	test('strips directories from posix and windows paths', () => {
		expect(artifactDownloadFileName('.humanlayer/tasks/slug/01-research.md')).toBe('01-research.md')
		expect(artifactDownloadFileName('C:\\docs\\plan.md')).toBe('plan.md')
		expect(artifactDownloadFileName('../../etc/passwd')).toBe('passwd')
	})

	test('replaces characters that break download names', () => {
		expect(artifactDownloadFileName('a<b>|c?.md')).toBe('a_b__c_.md')
	})

	test('does not treat dot-only names as a file', () => {
		expect(artifactDownloadFileName('.')).toBe('artifact')
		expect(artifactDownloadFileName('..')).toBe('artifact')
	})
})

describe('artifactDownloadMimeType', () => {
	test.each([
		['notes.md', 'text/markdown;charset=utf-8'],
		['page.html', 'text/html;charset=utf-8'],
		['data.json', 'application/json'],
		['events.jsonl', 'application/json'],
		['readme.txt', 'text/plain;charset=utf-8'],
		['scan.pdf', 'application/pdf'],
		['photo.png', 'application/octet-stream'],
	])('%s → %s', (fileName, mime) => {
		expect(artifactDownloadMimeType(fileName)).toBe(mime)
	})
})

describe('canDownloadArtifact', () => {
	test('allows a signed url even with empty content', () => {
		expect(canDownloadArtifact('', 'https://files.example/a.png')).toBe(true)
	})

	test('allows in-memory text', () => {
		expect(canDownloadArtifact('# plan', null)).toBe(true)
	})

	test('rejects an empty artifact', () => {
		expect(canDownloadArtifact('', null)).toBe(false)
		expect(canDownloadArtifact('', undefined)).toBe(false)
	})
})

describe('downloadArtifactFile', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	test('saves in-memory content as a same-origin blob download', async () => {
		const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:artifact')
		const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
		const fetchMock = vi.fn()
		vi.stubGlobal('fetch', fetchMock)
		const clicks: Array<{ href: string; download: string }> = []
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
			this: HTMLAnchorElement,
		) {
			clicks.push({ href: this.getAttribute('href') ?? this.href, download: this.download })
		})

		await downloadArtifactFile({ content: '# Plan', fileName: 'plan.md' })

		expect(fetchMock).not.toHaveBeenCalled()
		expect(createObjectURL).toHaveBeenCalledTimes(1)
		const blob = createObjectURL.mock.calls[0]?.[0] as Blob
		expect(blob).toBeInstanceOf(Blob)
		expect(blob.type).toBe('text/markdown;charset=utf-8')
		expect(await blob.text()).toBe('# Plan')
		expect(clicks).toEqual([{ href: 'blob:artifact', download: 'plan.md' }])
		expect(document.body.querySelector('a')).toBeNull()
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:artifact')
		click.mockRestore()
	})

	test('fetches a signed url before saving so the download is same-origin', async () => {
		const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:image')
		const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
		const bytes = new Uint8Array([1, 2, 3])
		const fetchMock = vi.fn(async () => new Response(bytes, { status: 200, headers: { 'content-type': 'image/png' } }))
		vi.stubGlobal('fetch', fetchMock)
		const clicks: Array<{ download: string }> = []
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
			this: HTMLAnchorElement,
		) {
			clicks.push({ download: this.download })
		})

		await downloadArtifactFile({
			content: '',
			fileName: 'shot.png',
			imageUrl: 'https://files.example/shot.png',
		})

		expect(fetchMock).toHaveBeenCalledWith('https://files.example/shot.png')
		expect(createObjectURL).toHaveBeenCalledTimes(1)
		expect(clicks).toEqual([{ download: 'shot.png' }])
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:image')
		click.mockRestore()
	})

	test('throws when the signed url cannot be fetched', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 403 })))
		await expect(
			downloadArtifactFile({ content: '', fileName: 'shot.png', imageUrl: 'https://files.example/shot.png' }),
		).rejects.toThrow(/Could not download the file/)
	})
})
