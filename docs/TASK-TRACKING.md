# RevTickets - Task Tracking

**Last Updated:** November 24, 2025  
**Team Repository:** https://github.com/darithedev/RevTickets

## Quick Navigation
- [Level 1 - Bugs](#level-1---bugs)
- [Level 1 - Enhancements](#level-1---enhancements)
- [Level 2 - Bugs](#level-2---bugs)
- [Level 2 - Enhancements](#level-2---enhancements)
- [Level 3 - Bugs](#level-3---bugs)
- [Level 3 - Enhancements](#level-3---enhancements)

## Status Legend
- **Not Started** - Task is available to claim
- **In Progress - [Name]** - Someone is actively working on this (e.g., "In Progress - John")
- **In Review - PR #123** - PR created, awaiting review (include PR number)
- **Complete - PR #123** - Merged to base-version (include PR number)

---

## About Task Priorities

**Important Notes:**

1. **Priorities are suggestions** - These priority levels were assigned based on the "Impact" descriptions from the instructor's wiki, NOT by the instructor directly.

2. **Team should review and adjust** - Feel free to discuss and change priorities based on:
   - What your team wants to showcase
   - What's achievable in the 6-day timeline
   - Dependencies between tasks
   - Your team's strengths and interests

3. **Choose what you're comfortable with** - While priorities provide guidance on importance, **you should select tasks that match your skill level and interest**. It's better to complete a "Low" priority task well than struggle with a "Critical" one.

4. **Priority Guide:**
   - **Critical** = System-breaking, data corruption, security vulnerabilities
   - **High** = Blocking functionality, users can't complete core tasks
   - **Medium** = Annoying but has workarounds, nice-to-have features
   - **Low** = Minor improvements, optional features (often AI-related requiring API keys)

5. **Recommended approach:** Start with tasks you feel confident about to build momentum, then tackle higher-priority items as a team.

---

## Level 1 - Bugs

| ID | Task Name | Description | Branch | Assignee | Status | Priority | PR # | Notes |
|---|---|---|---|---|---|---|---|---|
| L1-B1 | Navigation Broken Links | Sidebar navigation links return 404 errors for valid routes | `bug-l1-navigation-broken-links` |Dari | Completed | High |5 | |
| L1-B2 | Category Update Failure | Category edit form doesn't persist changes to database | `bug-l1-category-update-failure` | Safa| In Review | High |7 | |
| L1-B3 | Comment Timezone Display | Comments show UTC timestamps instead of user's local timezone | `bug-l1-comment-timezone` |Jason | Completed | Medium |3 | |
| L1-B4 | Duplicate Ticket Creation | Single form submission creates two identical tickets | `bug-l1-duplicate-ticket-creation` | Safa| Completed | Critical |2 | |
| L1-B5 | KB Search No Results | Knowledge Base search returns empty results for valid queries | `bug-l1-kb-search-failure` |Dari | Completed | High |6 | |

---

## Level 1 - Enhancements

| ID | Task Name | Description | Branch | Assignee | Status | Priority | PR # | Est. Hours | Notes |
|---|---|---|---|---|---|---|---|---|---|
| L1-E1 | Comment Editing | Allow users to edit comments within 24 hours with edit history | `enhancement-l1-comment-editing` | Safa| Completed | Medium |? | 6-8 |Was already completed by Ashoka Shringla! |
| L1-E2 | Ticket Reopening | Enable reopening resolved tickets within 10 business days | `enhancement-l1-ticket-reopening` |Safa | In Progress | Medium | | 8-10 | |
| L1-E3 | KB Title Search | Frontend search interface for Knowledge Base articles | `enhancement-l1-kb-title-search` | | Not Started | Medium | | 6-8 | |
| L1-E4 | AI Ticket Summary | AI-powered summaries for long ticket conversations | `enhancement-l1-ai-ticket-summary` | | Not Started | Low | | 8-10 | Requires Google API Key |
| L1-E5 | AI Closing Suggestions | AI-generated closing comment suggestions for agents | `enhancement-l1-ai-closing-suggestions` | | Not Started | Low | | 8-10 | Requires Google API Key |

---

## Level 2 - Bugs

| ID | Task Name | Description | Branch | Assignee | Status | Priority | PR # | Notes |
|---|---|---|---|---|---|---|---|---|
| L2-B1 | KB Editor Empty Content | Article editor loads with empty content despite data existing | `bug-l2-kb-edit-content-missing` | | Not Started | High | | |
| L2-B2 | SLA Weekend Calculation | SLA calculations don't account for business days | `bug-l2-sla-weekend-calculation` |Dari | In Progress | Medium | | |
| L2-B3 | Assignment Workload Ignored | Agent assignment doesn't properly distribute workload | `bug-l2-assignment-workload-ignored` | | Not Started | Medium | | |
| L2-B4 | AI Tags Title Only | AI tag generation only analyzes article titles, not content | `bug-l2-ai-tags-title-only` | | Not Started | Low | | Requires Google API Key |
| L2-B5 | File Size Display | File sizes show in bytes instead of KB/MB | `bug-l2-file-size-display` |Jason | Completed | Low |4 | |

---

## Level 2 - Enhancements

| ID | Task Name | Description | Branch | Assignee | Status | Priority | PR # | Est. Hours | Notes |
|---|---|---|---|---|---|---|---|---|---|
| L2-E1 | File Attachments | Add file upload capability to tickets and comments | `enhancement-l2-file-attachments` | | ✅ IMPLEMENTED | High | | 12-16 | Already in base-version |
| L2-E2 | SLA Automation | Automated SLA tracking with business day calculations | `enhancement-l2-sla-automation` | | Not Started | High | | 12-16 | |
| L2-E3 | AI KB Tags | AI-powered automatic tag generation for KB articles | `enhancement-l2-ai-kb-tags` | | Not Started | Medium | | 10-12 | Requires Google API Key |
| L2-E4 | KB Article Editing | Allow editing of existing knowledge base articles | `enhancement-l2-kb-edit` | | Not Started | High | | 10-12 | |
| L2-E5 | AI Agent Assignment | Intelligent agent assignment based on skills and workload | `enhancement-l2-ai-agent-assignment` | | Not Started | Medium | | 12-16 | Requires Google API Key |

---

## Level 3 - Bugs

| ID | Task Name | Description | Branch | Assignee | Status | Priority | PR # | Notes |
|---|---|---|---|---|---|---|---|---|
| L3-B1 | WebSocket Memory Leak | Dead connections accumulate causing server crashes | `bug-l3-websocket-memory-leak` | | Not Started | Critical | | Advanced debugging required |
| L3-B2 | Docker Resource Limits | Workers crash due to insufficient memory/CPU allocation | `bug-l3-docker-worker-resource-limits` | | Not Started | High | | |
| L3-B3 | Concurrent Update Race | Multiple agents updating same ticket causes data corruption | `bug-l3-concurrent-update-race-condition` | | Not Started | Critical | | Requires locking mechanism |
| L3-B4 | Search Index Corruption | KB search index corruption causes inconsistent results | `bug-l3-kb-search-index-corruption` | | Not Started | High | | |
| L3-B5 | WebSocket JWT Bypass | WebSocket connections don't validate JWT tokens | `bug-l3-websocket-jwt-bypass` | | Not Started | Critical | | Security vulnerability |

---

## Level 3 - Enhancements

| ID | Task Name | Description | Branch | Assignee | Status | Priority | PR # | Est. Hours | Notes |
|---|---|---|---|---|---|---|---|---|---|
| L3-E1 | Chat with Knowledge Base | RAG-based chatbot for KB article queries | `enhancement-l3-kb-chat` |Jason | In Progress | Medium | | 20-24 | Complex AI integration |
| L3-E2 | Live Agent Chat | Real-time chat between users and agents | `enhancement-l3-live-agent-chat` | | Not Started | High | | 20-24 | WebSocket implementation |
| L3-E3 | Escalations & Reassignment | Automatic ticket escalation based on SLA/priority | `enhancement-l3-escalations` | | Not Started | High | | 16-20 | Complex business logic |
| L3-E4 | NLP Sentiment Analysis | Real-time sentiment analysis of ticket content | `enhancement-l3-sentiment-analysis` | | Not Started | Low | | 16-20 | Requires AI integration |
| L3-E5 | Multi-language Support | Internationalization with auto-translation | `enhancement-l3-multi-language` | | Not Started | Medium | | 20-24 | Large scope |

---

## Summary Statistics

### Level 1
- **Total Tasks:** 10 (5 bugs + 5 enhancements)
- **Completed:** 0
- **In Progress:** 0
- **Available:** 10

### Level 2
- **Total Tasks:** 10 (5 bugs + 5 enhancements)
- **Completed:** 1 (File Attachments)
- **In Progress:** 0
- **Available:** 9

### Level 3
- **Total Tasks:** 10 (5 bugs + 5 enhancements)
- **Completed:** 0
- **In Progress:** 0
- **Available:** 10

### Overall Progress
- **Total Tasks:** 30
- **Completed:** 1 (3%)
- **In Progress:** 0 (0%)
- **Remaining:** 29 (97%)

---

## How to Use This Document

### Quick Reference: Updating Task Status

**To claim or update a task:**
```bash
# 1. Switch to tracking branch and pull latest
git checkout docs/task-track
git pull origin docs/task-track

# 2. Edit TASK-TRACKING.md (update your task row)

# 3. Commit and push (NO PR needed!)
git add docs/TASK-TRACKING.md
git commit -m "docs: Update [TaskID] - [YourName]"
git push origin docs/task-track
```

**Alternative: Edit directly on GitHub**
- Go to: https://github.com/darithedev/RevTickets/blob/docs/task-track/docs/TASK-TRACKING.md
- Click "Edit" (pencil icon)
- Make changes and commit directly to `docs/task-track`

---

### Detailed Workflow

1. **Claiming a Task:**
   - Pull latest: `git checkout docs/task-track && git pull origin docs/task-track`
   - Edit this file: Add your name to "Assignee", update "Status" to "In Progress"
   - Commit: `git commit -am "docs: Claim [TaskID] - YourName"`
   - Push: `git push origin docs/task-track`

2. **Working on Task:**
   - Checkout task branch: `git checkout bug-l1-category-update-failure`
   - Pull latest: `git pull origin bug-l1-category-update-failure`
   - Make your code changes and test locally
   - Push: `git push origin bug-l1-category-update-failure`

3. **Creating PR:**
   - Create PR on GitHub: your-branch → `base-version`
   - Update tracking: `git checkout docs/task-track && git pull origin docs/task-track`
   - Edit this file: Update "Status" to "In Review", add "PR #123" to PR # column
   - Commit and push: `git commit -am "docs: [TaskID] in review - PR #123" && git push origin docs/task-track`

4. **After PR is Merged:**
   - Update tracking: `git checkout docs/task-track && git pull origin docs/task-track`
   - Edit this file: Update "Status" to "Complete"
   - Commit and push: `git commit -am "docs: [TaskID] completed - PR #123" && git push origin docs/task-track`

5. **Handling Conflicts:**
   - If push fails: `git pull origin docs/task-track`
   - Git will auto-merge if you edited different rows
   - If conflict (same row), manually resolve and commit
   - Then push: `git push origin docs/task-track`

---

## Notes
- **Priority Guide:** Critical > High > Medium > Low
- **Base Branch:** All work branches from and merges to `base-version`
- **AI Features:** Require Google API Key configured in `.env`
- **Review Required:** All PRs need at least one team member review before merge
