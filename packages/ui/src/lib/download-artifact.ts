import { isHtmlFile, isJsonFile, isJsonlFile, isMarkdownFile, isPdfFile } from './file-types'

/** Browser download name for an artifact: basename only, with control characters stripped. */
export function artifactDownloadFileName(fileName?: string | null): string {
	const raw = fileName?.trim() || 'artifact'
	const base = raw.replace(/\\/g, '/').split('/').pop() ?? 'artifact'
	const cleaned = base.replace(/[\u0000-\u001f<>:"|?*]/g, '_').replace(/^\.+$/, '')
	return cleaned.length > 0 ? cleaned : 'artifact'
}

/** MIME type for a text or previewable artifact saved from in-memory content. */
export function artifactDownloadMimeType(fileName: string): string {
	if (isJsonFile(fileName) || isJsonlFile(fileName)) return 'application/json'
	if (isMarkdownFile(fileName)) return 'text/markdown;charset=utf-8'
	if (isHtmlFile(fileName)) return 'text/html;charset=utf-8'
	if (isPdfFile(fileName)) return 'application/pdf'
	if (/\.txt$/i.test(fileName)) return 'text/plain;charset=utf-8'
	return 'application/octet-stream'
}

export function canDownloadArtifact(content: string, imageUrl?: string | null): boolean {
	return Boolean(imageUrl) || content.length > 0
}

export type ArtifactDownloadSource = {
	content: string
	fileName?: string | null
	imageUrl?: string | null
}

/**
 * Save an artifact to the browser's downloads. S3-backed files (a signed `imageUrl`)
 * are fetched first so the `download` attribute is not ignored as a cross-origin navigation.
 */
export async function downloadArtifactFile(source: ArtifactDownloadSource): Promise<void> {
	const downloadName = artifactDownloadFileName(source.fileName)
	let objectUrl: string
	if (source.imageUrl) {
		const response = await fetch(source.imageUrl)
		if (!response.ok) {
			throw new Error(`Could not download the file (${String(response.status)}).`)
		}
		objectUrl = URL.createObjectURL(await response.blob())
	} else {
		const blob = new Blob([source.content], { type: artifactDownloadMimeType(downloadName) })
		objectUrl = URL.createObjectURL(blob)
	}
	try {
		const link = document.createElement('a')
		link.href = objectUrl
		link.download = downloadName
		document.body.appendChild(link)
		link.click()
		link.remove()
	} finally {
		URL.revokeObjectURL(objectUrl)
	}
}
