Download artifacts from the viewer

## What problem(s) was I solving?

Task files can be copied from the viewer, but there is no way to save the file itself on this computer. That is a problem when you want the original bytes in an editor or printer, and when the host that wrote the file is not this machine.

## What user-facing changes did I ship?

- A **Download file** control next to copy in the artifact viewer (desktop, cloud, shared, fullscreen, and the side panel).
- The same action on a file's right-click menu in the task file list.
- Images and other stored files save the original bytes. Markdown and other text files save the contents shown in the viewer.
- The saved name is the file's own name (directory prefixes stripped).
- If a download fails, the app tells you to copy the contents instead.

## How I implemented it

`downloadArtifactFile` in `packages/ui` saves in-memory text as a same-origin blob, and fetches a signed URL to a blob first so the `download` attribute is not ignored as a cross-origin navigation. Viewer headers and overflow menus call that helper. The default UI and the cloud viewer gain the control next to copy.

## How to verify it

- [ ] I have ensured `make check test` passes
- [ ] Open a markdown task file and choose **Download file** next to **Copy contents**; the browser saves `plan.md` (or the file's own name) with the viewer text
- [ ] Open an image artifact and download it; the saved file is the original image, not an empty document
- [ ] Right-click a file in the task file list and choose **Download file**

## Description for the changelog

Download task files from the artifact viewer and from a file's right-click menu, including when the file lives on another host.

## A picture of a cute animal (not mandatory but encouraged)
