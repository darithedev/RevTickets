# AI Assistant Prompts Log

This document tracks all prompts and interactions with AI assistants during the development of RevTickets.

## Purpose
- Track AI-assisted development decisions
- Share context with team members
- Document the evolution of features
- Provide transparency in AI-assisted development

---

## Branch: claude/list-chat-prompts-01BfY5QgDYraT5JrXnMyLnAA
**Date:** 2025-11-20
**Engineer:** [Your Name]
**Session ID:** 01BfY5QgDYraT5JrXnMyLnAA

### Prompts:
1. **"Make a list of every prompt I've asked this chat related to this repo, please."**
   - Context: Wanted to track previous prompts
   - Outcome: Learned each chat session is independent

2. **"Well not only this conversation, but every conversation that is linked to this repo"**
   - Context: Trying to access cross-session history
   - Outcome: Confirmed no cross-session access available

3. **"Well, I am working on a team of 5 engineers and they all would like to see the prompts I used and the progression of the project from each branch etc. what's the best solution for achieving that"**
   - Context: Need team visibility into AI-assisted development
   - Outcome: Recommended PROMPTS.md + detailed commits approach

4. **"Can we do both 1 and 2 please, thanks."**
   - Context: Requested implementation of PROMPTS.md and commit template
   - Outcome: Created this file + git commit template

### Summary:
Set up team documentation system for tracking AI-assisted development work.

### Key Decisions:
- Use PROMPTS.md for session-level tracking
- Use detailed commit messages for granular change tracking
- Configure git commit template for consistency

### Commits:
- TBD

---

## Template for New Sessions

Copy this template when starting a new AI-assisted session:

```markdown
## Branch: [branch-name]
**Date:** YYYY-MM-DD
**Engineer:** [Your Name]
**Session ID:** [if available]

### Prompts:
1. **"[Exact prompt text]"**
   - Context: [Why you asked this]
   - Outcome: [What happened / what was built]

2. **"[Next prompt]"**
   - Context: [Why you asked this]
   - Outcome: [What happened]

### Summary:
[1-2 sentence overview of what was accomplished]

### Key Decisions:
- [Important technical decisions made]
- [Architectural choices]
- [Trade-offs considered]

### Commits:
- [commit hash]: [commit message]
- [commit hash]: [commit message]

### Files Changed:
- [list of main files modified/created]

### Notes:
[Any additional context for the team]
```

---

## Guidelines for Team Members

### When to Log:
- ✅ At the start of each AI-assisted session
- ✅ After major feature completions
- ✅ When making architectural decisions
- ✅ Before creating pull requests

### What to Include:
- **Exact prompts**: Copy-paste what you asked
- **Context**: Why you asked (business need, bug, feature request)
- **Outcome**: What the AI built or recommended
- **Decisions**: Any choices you made during the conversation

### What NOT to Include:
- ❌ Simple typo fixes or formatting changes
- ❌ Standard debugging that didn't involve AI
- ❌ Prompts unrelated to this repository

---

## Archive

(Older sessions will be moved here to keep the main log clean)
