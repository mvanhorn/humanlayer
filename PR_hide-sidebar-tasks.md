Hide tasks from your sidebar

## What problem(s) was I solving?

The sidebar lists every task in the workspace, including colleagues' work you no longer need to follow. Archiving is the only way to trim the list, and that affects the whole team.

## What user-facing changes did I ship?

- **Hide task** on a task's sidebar menu (and on the task menu in a session). Hiding is only for you, on this device. The task stays in the workspace and teammates still see it.
- **Show hidden tasks** in the sidebar when you have hidden any. Turn it on to see those rows, then **Unhide task** to put one back.
- An undo toast after you hide a task.

## How I implemented it

A per-user, per-organization local store records hidden task IDs. The default sidebar and the projects sidebar filter those IDs out of the list unless **Show hidden tasks** is on. Saved sidebar order is unchanged, so unhiding a task puts it back where it was.

## How to verify it

- [ ] I have ensured `make check test` passes
- [ ] Right-click a task you do not need to follow and choose **Hide task**; it leaves your sidebar and stays open for everyone else
- [ ] Choose **Show hidden tasks**, then **Unhide task** on that row; it returns to the list
- [ ] Reload the app: hidden tasks stay hidden for you

## Description for the changelog

Hide tasks from your sidebar without archiving them. Hiding is personal; choose Show hidden tasks to restore a row.

## A picture of a cute animal (not mandatory but encouraged)
