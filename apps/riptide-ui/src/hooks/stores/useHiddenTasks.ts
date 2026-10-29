import { useAuth } from '@workos-inc/authkit-react'
import { useMemo } from 'react'
import { useStore } from 'zustand'

import { createHiddenTasksStore, type HiddenTasksStore } from '@/hooks/stores/hiddenTasksStore'

export function useHiddenTasksStore(): HiddenTasksStore {
	const { user, organizationId } = useAuth()
	const userId = user?.id ?? 'anonymous'
	const orgId = organizationId ?? 'none'
	return useMemo(() => createHiddenTasksStore(userId, orgId), [userId, orgId])
}

/** Personal sidebar hides for this signed-in user and organization, on this device. */
export function useHiddenTasks() {
	const store = useHiddenTasksStore()
	const hiddenTaskIds = useStore(store, (state) => state.hiddenTaskIds)
	const showHidden = useStore(store, (state) => state.showHidden)
	return {
		hiddenTaskIds,
		showHidden,
		hide: store.getState().hide,
		unhide: store.getState().unhide,
		setShowHidden: store.getState().setShowHidden,
		isHidden: (taskId: string) => hiddenTaskIds.includes(taskId),
	}
}
