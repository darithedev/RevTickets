# Contributing to RevTickets

## AI-Assisted Development Workflow

Our team uses AI assistants to accelerate development. Here's how we track and share that work:

### 1. Before Starting AI-Assisted Work

1. Create or switch to your feature branch
2. Open `PROMPTS.md` and add a new section using the template
3. Start your AI assistant session

### 2. During Development

**Log your prompts:**
- Copy each significant prompt you give to the AI
- Add context about WHY you asked
- Note the outcome or what was built

**Use detailed commits:**
- When ready to commit, git will open the commit message template
- Fill in all relevant sections
- Include the AI prompt if applicable

### 3. After Development

**Update PROMPTS.md:**
- Add commit hashes to your session log
- Summarize what was accomplished
- List key decisions made

**Create Pull Request:**
- Reference your PROMPTS.md section
- Include summary of AI interactions
- List manual changes you made (if any)

---

## Commit Message Template

Our repository is configured with a commit message template. When you run `git commit`, you'll see:

```
# <type>: <subject> (max 50 chars)

# Explain why this change is being made

# Prompt: [What you asked the AI assistant, if applicable]

# Context: [Business need, bug report, feature request]
...
```

**Usage:**
```bash
git commit
# Template opens in your editor
# Fill in the sections
# Delete comment lines (starting with #)
# Save and close
```

**Quick commit (bypass template):**
```bash
git commit -m "feat: add user authentication

Prompt: Add OAuth2 authentication with JWT tokens
Context: Security requirement for mobile app release
Implementation: Added auth middleware and tests"
```

---

## Example Workflow

```bash
# 1. Create feature branch
git checkout -b claude/add-notifications-xyz123

# 2. Update PROMPTS.md with new session section
# (Add your session info and first prompt)

# 3. Work with AI assistant
# (Continue logging prompts as you work)

# 4. Commit changes with detailed message
git add .
git commit
# Fill in the template with your prompt and context

# 5. Push to remote
git push -u origin claude/add-notifications-xyz123

# 6. Update PROMPTS.md with commit hash
# 7. Create PR with reference to PROMPTS.md section
```

---

## Best Practices

### ✅ DO:
- Log every significant AI prompt
- Include context for why you asked
- Use the commit template for AI-assisted work
- Update PROMPTS.md before creating PRs
- Share interesting AI interactions with the team

### ❌ DON'T:
- Commit without context
- Skip the PROMPTS.md log for AI work
- Use vague commit messages like "fix stuff"
- Forget to mention AI assistance in commits

---

## Team Review Guidelines

When reviewing PRs with AI-assisted development:

1. **Check PROMPTS.md** - Was the session logged?
2. **Review commits** - Do they include context and prompts?
3. **Verify decisions** - Were key technical decisions documented?
4. **Test thoroughly** - AI code should be tested like any other code

---

## Questions?

Ask in the team chat or update this guide with what you learned!
