Create a pull request for the current branch.

Follow these steps:
1. Run `/find-unused-deps` command to find and remove unused dependencies
2. Run `/suggest-deduplication` command to identify and fix code duplication
3. Run `/lint-and-fix` command to check and fix code style violations
   - **NOTE: `/lint-and-fix` is a skill (slash command), NOT a simple `biome check` or `pnpm lint`. You MUST invoke it via the Skill tool.** This skill checks CLAUDE.md and `.claude/rules/*` guidelines in addition to Biome rules. Read the skill's output thoroughly and fix all reported issues.
4. Run `/review` command to perform comprehensive code review
5. Review the code review results and fix any issues identified:
   - Address security vulnerabilities
   - Fix bugs and logic errors
   - Improve code quality based on suggestions
   - Commit the fixes with an appropriate message
6. Run `/code-metrics` command to analyze code complexity
   - Check if there are any files with Maintainability Index (MI) < 10
   - These files are in the "red zone" and need immediate attention
7. Refactor files based on Maintainability Index and Cognitive Complexity thresholds:
   - **Critical (MI < 10)**: All files must be refactored to MI >= 10
   - **Warning (MI <= 30)**: Ensure less than 5% of total files are in this range
   - **Cognitive Complexity >= 30**: All functions must be refactored to CC < 30 (no exceptions)
   - **Cognitive Complexity >= 25**: Ensure less than 5% of total functions are in this range
   - For files needing refactoring:
     - Break down large functions/components
     - Reduce cyclomatic complexity
     - Simplify logic and improve readability
     - Split functions with high cognitive complexity into smaller, focused functions
   - Re-run `/code-metrics` to verify:
     - No files have MI < 10 (red zone)
     - Files with MI <= 30 are less than 5% of total files
     - No function has Cognitive Complexity >= 30
     - Functions with Cognitive Complexity >= 25 are less than 5% of total functions
   - If threshold not met, refactor the worst offenders until targets are achieved
8. If there are any changes from the previous commands, commit them with an appropriate message
9. Run `git status` to see all untracked files and changes
10. Run `git diff` to see both staged and unstaged changes
11. Check if the current branch tracks a remote branch and is up to date
12. Run `git log main...HEAD` to understand the full commit history for the current branch
13. Analyze all changes that will be included in the pull request
14. Run `/adr` to create an ADR documenting the architectural decisions behind this PR:
   - Based on the analyzed changes (steps 12-13), summarize the decision context, what was decided, and its consequences
   - If the changes lack sufficient background information to write a meaningful ADR (e.g., why this approach was chosen over alternatives, what constraints influenced the decision), ask the user for clarification before creating the ADR
   - The ADR should focus on the "why" behind the changes, not just the "what"
15. Draft a concise PR summary with:
   - **Title**: Clear, descriptive title summarizing the changes
   - **Summary**: 1-3 bullet points describing what changed and why
   - **Code Metrics**: Include the final `/code-metrics` results in a collapsible `<details>` section:
     - Summary table (total files, avg MI, files "Could be better")
     - Cognitive Complexity: top functions with CC >= 15 (if any remain)
     - Maintainability Index: worst MI files (bottom 10)
     - Threshold compliance status (all passed / which failed)
   - **Test plan**: Bulleted checklist of steps to test the changes
16. Run `/add-e2e-test` command to add E2E tests for the changes
17. Push to remote with `-u` flag if the branch doesn't track a remote yet
18. Create the PR using `gh pr create` with the drafted title and body
19. Return the PR URL

**Important:**
- **CRITICAL: This workflow has 19 steps. Execute every step in order from 1 to 19. Do NOT skip any step, even if it seems unnecessary. After completing each step, verify you are proceeding to the correct next step number before continuing.**
- Base branch should be `main` (the project's main branch)
- Include "🤖 Generated with [Claude Code](https://claude.com/claude-code)" at the end of PR body
- Make sure to analyze ALL commits that will be included in the PR, not just the latest one
