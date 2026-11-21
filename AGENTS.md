# CalTune

- Before every commit, review the complete staged diff and any staged binary files or metadata for material unsuitable for a public repository. Check for credentials, tokens, personal data, private calendar URLs, and internal account, workspace, project, or deployment identifiers. Unstage or redact any such material before committing, and continue only once the staged changes are safe to publish. Keep the local Sites manifest and other private configuration out of Git. Do not echo suspected secrets in logs or reports.
- Keep README.md up to date when changes affect the user interface, API, build, or publishing workflow.
- For every production publication, push the published commit to `main` in `git@github.com:enoxnl/CalTune.git`. Verify that the remote branch contains that commit before reporting the publication complete.
