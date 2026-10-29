import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { createStore } from 'zustand/vanilla'

export interface HiddenTasksState {
	hiddenTaskIds: string[]
	showHidden: boolean
	hide: (taskId: string) => void
	unhide: (taskId: string) => void
	setShowHidden: (showHidden: boolean) => void
	isHidden: (taskId: string) => boolean
}

function strings(value: unknown): string[] {
	return Array.isArray(value)
		? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))]
		: []
}

export function parseHiddenTasksState(value: unknown): Pick<HiddenTasksState, 'hiddenTaskIds' | 'showHidden'> {
	if (!value || typeof value !== 'object') return { hiddenTaskIds: [], showHidden: false }
	const input = value as { hiddenTaskIds?: unknown; showHidden?: unknown }
	return {
		hiddenTaskIds: strings(input.hiddenTaskIds),
		showHidden: input.showHidden === true,
	}
}

export function hiddenTasksStorageKey(userId: string, organizationId: string): string {
	return `hidden-tasks:v1:${encodeURIComponent(organizationId)}:${encodeURIComponent(userId)}`
}

const browserStorage: StateStorage = {
	getItem: (key) => {
		try {
			return localStorage.getItem(key)
		} catch {
			return null
		}
	},
	setItem: (key, value) => {
		try {
			localStorage.setItem(key, value)
		} catch {
			console.warn('Hidden tasks could not be saved locally')
		}
	},
	removeItem: (key) => {
		try {
			localStorage.removeItem(key)
		} catch {
			console.warn('Hidden tasks could not be cleared locally')
		}
	},
}

/** A separate store instance/key per authenticated user and organization. */
export function createHiddenTasksStore(userId: string, organizationId: string, storage?: StateStorage) {
	return createStore<HiddenTasksState>()(
		persist(
			(set, get) => ({
				hiddenTaskIds: [],
				showHidden: false,
				hide: (taskId) =>
					set((state) => {
						if (state.hiddenTaskIds.includes(taskId)) return state
						return { hiddenTaskIds: [...state.hiddenTaskIds, taskId] }
					}),
				unhide: (taskId) =>
					set((state) => {
						if (!state.hiddenTaskIds.includes(taskId)) return state
						const hiddenTaskIds = state.hiddenTaskIds.filter((id) => id !== taskId)
						return {
							hiddenTaskIds,
							showHidden: hiddenTaskIds.length === 0 ? false : state.showHidden,
						}
					}),
				setShowHidden: (showHidden) => set({ showHidden }),
				isHidden: (taskId) => get().hiddenTaskIds.includes(taskId),
			}),
			{
				name: hiddenTasksStorageKey(userId, organizationId),
				storage: createJSONStorage(() => storage ?? browserStorage),
				partialize: (state) => ({ hiddenTaskIds: state.hiddenTaskIds, showHidden: state.showHidden }),
				merge: (persisted, current) => ({
					...current,
					...parseHiddenTasksState(persisted),
				}),
			},
		),
	)
}

export type HiddenTasksStore = ReturnType<typeof createHiddenTasksStore>
