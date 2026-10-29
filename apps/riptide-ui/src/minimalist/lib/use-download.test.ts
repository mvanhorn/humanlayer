import { afterEach, describe, expect, it, vi } from 'vitest'

const downloadArtifactFile = vi.fn()
const showToast = vi.fn()

vi.mock('@humanlayer/ui/lib/download-artifact', () => ({
	downloadArtifactFile: (...args: unknown[]) => downloadArtifactFile(...args),
}))
vi.mock('@/minimalist/lib/ui-state', () => ({
	useUi: () => ({ showToast }),
}))

describe('useDownload', () => {
	afterEach(() => {
		downloadArtifactFile.mockReset()
		showToast.mockReset()
	})

	it('saves the file without a toast when the download finishes', async () => {
		downloadArtifactFile.mockResolvedValue(undefined)
		const { useDownload } = await import('./use-download')
		useDownload()('# plan', 'plan.md')
		await vi.waitFor(() => {
			expect(downloadArtifactFile).toHaveBeenCalledWith({
				content: '# plan',
				fileName: 'plan.md',
				imageUrl: undefined,
			})
		})
		expect(showToast).not.toHaveBeenCalled()
	})

	it('tells you to copy the contents when the download fails', async () => {
		downloadArtifactFile.mockRejectedValue(new Error('network'))
		const { useDownload } = await import('./use-download')
		useDownload()('shot', 'shot.png', 'https://files.example/shot.png')
		await vi.waitFor(() => {
			expect(showToast).toHaveBeenCalledWith('Could not download the file. Copy the contents instead.')
		})
	})
})
