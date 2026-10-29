/** Tasks you hid stay out of the sidebar unless you ask to see them. */
export function visibleSidebarTasks<Task>(
	tasks: readonly Task[],
	idOf: (task: Task) => string,
	hiddenTaskIds: readonly string[],
	showHidden: boolean,
): Task[] {
	if (showHidden || hiddenTaskIds.length === 0) return [...tasks]
	const hidden = new Set(hiddenTaskIds)
	return tasks.filter((task) => !hidden.has(idOf(task)))
}

export function hasHiddenSidebarTasks(hiddenTaskIds: readonly string[], showHidden: boolean): boolean {
	return hiddenTaskIds.length > 0 || showHidden
}
