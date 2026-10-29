import { beforeEach, describe, expect, test } from 'vitest'

import { createHiddenTasksStore, hiddenTasksStorageKey, parseHiddenTasksState } from '@/hooks/stores/hiddenTasksStore'

describe('hidden tasks store', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	test('persists hides across reload and isolates users and organizations', () => {
		const store = createHiddenTasksStore('me', 'org')
		store.getState().hide('task-a')
		store.getState().hide('task-b')
		store.getState().setShowHidden(true)
		expect(createHiddenTasksStore('me', 'org').getState()).toMatchObject({
			hiddenTaskIds: ['task-a', 'task-b'],
			showHidden: true,
		})
		expect(createHiddenTasksStore('someone', 'org').getState().hiddenTaskIds).toEqual([])
		expect(createHiddenTasksStore('me', 'other-org').getState().hiddenTaskIds).toEqual([])
		expect(localStorage.getItem(hiddenTasksStorageKey('me', 'org'))).toContain('task-a')
	})

	test('hide is idempotent and unhide turns off the show-hidden toggle when none remain', () => {
		const store = createHiddenTasksStore('me', 'org')
		store.getState().hide('task-a')
		store.getState().hide('task-a')
		store.getState().setShowHidden(true)
		expect(store.getState().hiddenTaskIds).toEqual(['task-a'])
		store.getState().unhide('missing')
		expect(store.getState().showHidden).toBe(true)
		store.getState().unhide('task-a')
		expect(store.getState().hiddenTaskIds).toEqual([])
		expect(store.getState().showHidden).toBe(false)
		expect(store.getState().isHidden('task-a')).toBe(false)
	})

	test('sanitizes malformed and duplicate storage', () => {
		expect(parseHiddenTasksState({ hiddenTaskIds: ['a', 3, 'a', ''], showHidden: 'yes' })).toEqual({
			hiddenTaskIds: ['a'],
			showHidden: false,
		})
		expect(parseHiddenTasksState({ hiddenTaskIds: ['b'], showHidden: true })).toEqual({
			hiddenTaskIds: ['b'],
			showHidden: true,
		})
		localStorage.setItem(hiddenTasksStorageKey('me', 'org'), 'not json')
		expect(createHiddenTasksStore('me', 'org').getState().hiddenTaskIds).toEqual([])
	})
})
