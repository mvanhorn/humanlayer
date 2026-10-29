import { downloadArtifactFile } from '@humanlayer/ui/lib/download-artifact'

import { useUi } from '@/minimalist/lib/ui-state'

/** Save a file to the browser's downloads, and say so if it fails. */
export function useDownload() {
	const { showToast } = useUi()
	return (content: string, fileName: string, imageUrl?: string | null) =>
		void downloadArtifactFile({ content, fileName, imageUrl }).catch(() =>
			showToast('Could not download the file. Copy the contents instead.'),
		)
}
