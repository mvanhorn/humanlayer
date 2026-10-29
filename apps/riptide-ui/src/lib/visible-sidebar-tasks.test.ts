import { describe, expect, test } from 'vitest'

import { hasHiddenSidebarTasks, visibleSidebarTasks } from './visible-sidebar-tasks'

describe('visibleSidebarTasks', () => {
	const tasks = [{ id: 'keep' }, { id: 'hide-me' }, { id: 'also' }]

	test('returns every task when none are hidden', () => {
		expect(visibleSidebarTasks(tasks, (task) => task.id, [], false)).toEqual(tasks)
	})

	test('omits hidden tasks until you show them', () => {
		expect(visibleSidebarTasks(tasks, (task) => task.id, ['hide-me'], false).map((task) => task.id)).toEqual([
			'keep',
			'also',
		])
		expect(visibleSidebarTasks(tasks, (task) => task.id, ['hide-me'], true)).toEqual(tasks)
	})

	test('does not rewrite the remaining order', () => {
		expect(visibleSidebarTasks(['c', 'a', 'b'], (id) => id, ['a'], false)).toEqual(['c', 'b'])
	})
})

describe('hasHiddenSidebarTasks', () => {
	test('shows the toggle while any task is hidden or you are viewing hidden tasks', () => {
		expect(hasHiddenSidebarTasks([], false)).toBe(false)
		expect(hasHiddenSidebarTasks(['task'], false)).toBe(true)
		expect(hasHiddenSidebarTasks([], true)).toBe(true)
	})
})
