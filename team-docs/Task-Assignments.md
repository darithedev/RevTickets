# Team 1 - Task Assignments & Tracking

## Overview

**Team Size**: 5 members  
**Timeline**: 6 days total for Level 1 + Level 2  
**Integration Branches**: 
- L1: `team1-level-1-integration` (from `base-version`)
- L2: `team1-level-2-integration` (from `level-1-complete`)

## Task Selection Philosophy

**Self-Selection Model**: Team members CHOOSE tasks based on:
- ✅ Personal interest and expertise (frontend, backend, AI, etc.)
- ✅ Current availability and capacity
- ✅ Task complexity vs experience level
- ✅ What hasn't been claimed yet

**How It Works**:
1. Review available tasks below
2. Announce your choice in Slack: "Claiming bug-l1-kb-search-failure"
3. Team Lead updates tracking (or use Slack pins)
4. Create your branch and start working
5. When done, claim next task

**Guidelines**:
- Start with 1-2 tasks, don't over-commit
- Bugs are usually quicker than enhancements
- Check reference branches if stuck (after trying for 2 hours)
- Communicate if you want to swap or drop a task
- First-come-first-served, but be flexible!

---

## Level 1 Task Assignments

### 🐛 Bugs (5 total)

#### 1. bug-l1-kb-search-failure
**Status**: 🟢 Available  
**Claimed by**: _[Unclaimed - announce in Slack to claim]_  
**Branch name**: `bug-l1-kb-search-failure-[YOUR-INITIALS]`  
**Description**: Knowledge Base search returns no results even when matching articles exist  
**Likely files**: 
- Backend: `src/services/article_service.py`
- Frontend: `src/app/features/articles/` (search component)

**Priority**: High  
**Estimated effort**: 4-6 hours  
**Expertise needed**: Backend (Python/FastAPI) + some Frontend

---

#### 2. bug-l1-navigation-broken-links
**Status**: 🟢 Available  
**Claimed by**: _[Unclaimed - announce in Slack to claim]_  
**Branch name**: `bug-l1-navigation-broken-links-[YOUR-INITIALS]`  
**Description**: Navigation links in sidebar/header leading to 404 or wrong pages  
**Likely files**: 
- Frontend: `src/app/shared/components/Sidebar.tsx`
- Frontend: `src/app/shared/components/Header.tsx`
- Frontend: `src/constants/routes.ts`

**Priority**: High  
**Estimated effort**: 3-5 hours  
**Expertise needed**: Frontend (React/Next.js)

---

#### 3. bug-l1-comment-timezone
**Status**: 🟢 Available  
**Claimed by**: _[Unclaimed - announce in Slack to claim]_  
**Branch name**: `bug-l1-comment-timezone-[YOUR-INITIALS]`  
**Description**: Comment timestamps showing incorrect timezone or format  
**Likely files**: 
- Backend: `src/models/comment.py`
- Frontend: `src/lib/utils/date.ts`

**Priority**: Medium  
**Estimated effort**: 3-4 hours  
**Expertise needed**: Full-Stack (timestamp handling both sides)

---

#### 4. bug-l1-duplicate-ticket-creation
**Status**: 🟢 Available  
**Claimed by**: _[Unclaimed - announce in Slack to claim]_  
**Branch name**: `bug-l1-duplicate-ticket-creation-[YOUR-INITIALS]`  
**Description**: Users can submit ticket form multiple times, creating duplicates  
**Likely files**: 
- Backend: `src/api/v1/routes/ticket.py`
- Frontend: `app/tickets/create/page.tsx`

**Priority**: High  
**Estimated effort**: 4-6 hours  
**Expertise needed**: Full-Stack (form submission + API)

---

#### 5. bug-l1-category-update-failure
**Status**: 🟢 Available  
**Claimed by**: _[Unclaimed - announce in Slack to claim]_  
**Branch name**: `bug-l1-category-update-failure-[YOUR-INITIALS]`  
**Description**: Category updates fail or don't reflect in database  
**Likely files**: 
- Backend: `src/services/category_service.py`
- Backend: `src/api/v1/routes/category.py`

**Priority**: Medium  
**Estimated effort**: 4-5 hours  
**Expertise needed**: Backend (Python/FastAPI/MongoDB)

---

### ✨ Enhancements (5 total)

#### 1. enhancement-l1-ai-ticket-summary
**Status**: 🟢 Available  
**Claimed by**: _[Unclaimed - announce in Slack to claim]_  
**Branch name**: `enhancement-l1-ai-ticket-summary-[YOUR-INITIALS]`  
**Description**: Add AI-powered ticket summary generation using LangChain  
**Requirements**:
- Generate intelligent summaries of tickets
- Add "Generate Summary" button on ticket detail page
- Display summary in dedicated section
- Handle AI API failures gracefully

**Likely files**: 
- Backend: `src/langchain_app/chains/` (new summary chain)
- Backend: `src/services/ai_service.py`
- Backend: `src/api/v1/routes/ai.py`
- Frontend: `app/tickets/[id]/page.tsx`

**Priority**: High  
**Estimated effort**: 6-8 hours  
**Expertise needed**: Backend (Python/LangChain/AI) + some Frontend

---

#### 2. enhancement-l1-kb-title-search
**Status**: 🟢 Available  
**Claimed by**: _[Unclaimed - announce in Slack to claim]_  
**Branch name**: `enhancement-l1-kb-title-search-[YOUR-INITIALS]`  
**Description**: Add search functionality to Knowledge Base by article titles  
**Requirements**:
- Add search input in KB page
- Case-insensitive search
- Display results with highlighting
- Clear search functionality

**Likely files**: 
- Backend: `src/services/article_service.py` (add search endpoint)
- Frontend: `app/knowledge-base/page.tsx`
- Frontend: `src/lib/api/articles.ts`

**Priority**: Medium  
**Estimated effort**: 5-6 hours  
**Expertise needed**: Full-Stack (Backend search + Frontend UI)

---

#### 3. enhancement-l1-ai-closing-suggestions
**Status**: 🟢 Available  
**Claimed by**: _[Unclaimed - announce in Slack to claim]_  
**Branch name**: `enhancement-l1-ai-closing-suggestions-[YOUR-INITIALS]`  
**Description**: AI-generated closing comment suggestions when closing tickets  
**Requirements**:
- Generate contextual closing comments
- Suggest resolution notes
- Handle different ticket categories

**Likely files**: 
- Backend: `src/langchain_app/chains/generate_closing_comments.py`
- Backend: `src/services/ai_service.py`
- Backend: `src/api/v1/routes/ai.py`
- Frontend: `app/tickets/[id]/page.tsx`

**Priority**: Medium  
**Estimated effort**: 6-7 hours  
**Expertise needed**: Backend (Python/LangChain/AI) + some Frontend

---

#### 4. enhancement-l1-comment-editing
**Status**: 🟢 Available  
**Claimed by**: _[Unclaimed - announce in Slack to claim]_  
**Branch name**: `enhancement-l1-comment-editing-[YOUR-INITIALS]`  
**Description**: Allow users to edit their own comments within time window  
**Requirements**:
- Edit button on own comments
- 5-minute edit window after posting
- Show "edited" badge on edited comments
- Only author can edit

**Likely files**: 
- Backend: `src/api/v1/routes/comment.py` (add PUT endpoint)
- Backend: `src/services/comment_service.py`
- Frontend: Comment components in ticket detail page

**Priority**: Low  
**Estimated effort**: 5-6 hours  
**Expertise needed**: Full-Stack (Backend API + Frontend UI)

---

#### 5. enhancement-l1-ticket-reopening
**Status**: 🟢 Available  
**Claimed by**: _[Unclaimed - announce in Slack to claim]_  
**Branch name**: `enhancement-l1-ticket-reopening-[YOUR-INITIALS]`  
**Description**: Allow agents to reopen closed tickets  
**Requirements**:
- "Reopen" button on closed tickets (agents only)
- Add reopening reason/comment
- Update ticket status to "open"
- Track reopen history

**Likely files**: 
- Backend: `src/api/v1/routes/ticket.py`
- Backend: `src/services/ticket_service.py`
- Frontend: `app/tickets/[id]/page.tsx`

**Priority**: Low  
**Estimated effort**: 4-5 hours  
**Expertise needed**: Full-Stack (Backend logic + Frontend button/UI)

---

## Task Status Tracking

### How to Track Tasks

**In Slack #team1-daily-standup**:

When claiming a task:
```
🎯 Claiming: bug-l1-kb-search-failure
👤 Member: [Your Name]
🚀 Starting now
```

Daily standup format:
```
**Day X - [Your Name]**
📋 Claimed Tasks: bug-l1-kb-search-failure, enhancement-l1-ai-summary
✅ Yesterday: Fixed KB search, created PR #15
🔨 Today: Starting AI summary enhancement
🚫 Blockers: None
```

When completing a task:
```
✅ Completed: bug-l1-kb-search-failure
📎 PR: #15
🔍 Ready for review!
📝 Next: Claiming enhancement-l1-kb-title-search
```

### Quick Status Legend

- 🟢 Available - No one claimed yet
- 🟡 In Progress - Someone is working on it
- 🔵 In Review - PR submitted, being reviewed
- ✅ Complete - Merged and done

**Team Lead**: Please pin task claims in Slack or maintain a simple tracking message that gets updated.

---

## Level 2 Tasks (Start after L1 progress)

### Level 2 Bugs (5 total - Self-select like L1)

1. **bug-l2-ai-tags-title-only** - AI tags only considering title, not content
2. **bug-l2-assignment-workload-ignored** - Ticket assignment not considering agent workload
3. **bug-l2-file-size-display** - File size displaying incorrectly
4. **bug-l2-kb-edit-content-missing** - KB article edit loses content
5. **bug-l2-sla-weekend-calculation** - SLA calculation includes weekends incorrectly

### Level 2 Enhancements (5 total - Self-select like L1)

1. **enhancement-l2-ai-agent-assignment** - AI-powered automatic agent assignment
2. **enhancement-l2-ai-kb-tags** - AI-generated tags for KB articles
3. **enhancement-l2-file-attachments** - File upload/download for tickets
4. **enhancement-l2-kb-edit** - Edit existing KB articles
5. **enhancement-l2-sla-automation** - Automated SLA tracking and notifications

**Note**: Detailed L2 task descriptions will be added once team reaches L2. Same self-selection process applies!

---

## Level 3 (Bonus - if time permits) ⭐

- **enhancement-l3-kb-chat** - AI chat interface for KB
- Additional advanced features with n8n integration
- Cross-module architectural improvements

**Note**: L3 is stretch goal territory. Focus on L1 & L2 quality over quantity.

---

## Reference Resources

### Checking Reference Branches (When Stuck)
```bash
# See what files were changed in reference solution
git diff base-version..bug-l1-kb-search-failure --name-only

# See actual code changes
git diff base-version..bug-l1-kb-search-failure

# Temporarily checkout to explore (read-only)
git checkout bug-l1-kb-search-failure
# When done, go back to your branch
git checkout bug-l1-kb-search-failure-[YOUR-INITIALS]
```

### Testing Your Changes
```bash
# Always test in clean environment
docker-compose down
docker-compose up --build

# Test your specific fix
# Test that nothing else broke
# Test with different user roles (user vs agent)
```

---

## Suggested Team Roles (Flexible)

### Team Lead / Coordinator
**Responsibilities**:
- Track task claims and completions
- Facilitate daily standups
- PR approvals and merges to integration branch
- Help unblock team members
- Decide when to move from L1 to L2

**Suggested Task Types**: Complex bugs, integration tasks, AI features

---

### Frontend-Focused Members
**Suggested for those comfortable with**: React, Next.js, TypeScript, UI/UX

**Good Task Matches**:
- bug-l1-navigation-broken-links
- enhancement-l1-kb-title-search
- enhancement-l1-comment-editing
- Any tasks with heavy frontend component work

---

### Backend-Focused Members
**Suggested for those comfortable with**: Python, FastAPI, MongoDB, APIs

**Good Task Matches**:
- bug-l1-kb-search-failure
- bug-l1-category-update-failure
- enhancement-l1-ticket-reopening
- Any tasks with API/database work

---

### Full-Stack Members
**Comfortable with both frontend and backend**

**Good Task Matches**:
- bug-l1-duplicate-ticket-creation
- bug-l1-comment-timezone
- Any enhancement requiring both frontend + backend
- Flexible based on what's available

---

### AI/LangChain Enthusiasts
**For those interested in AI integration**

**Good Task Matches**:
- enhancement-l1-ai-ticket-summary
- enhancement-l1-ai-closing-suggestions
- Any L2 AI enhancements

**Note**: These are suggestions! Pick what interests you and matches your comfort level. Everyone can claim any task.

---

## Priority Guidance for 6-Day Timeline

### Critical Priority (Must Do):
- ✅ **All Level 1 bugs** (5 bugs) - These are critical fixes
- ✅ **Key L1 enhancements**: AI summary, KB search (high-value features)
- ✅ **Some Level 2 bugs** (at least 3) - More complex fixes

### Medium Priority (Should Do if Time):
- 🟡 **Remaining L1 enhancements** (lower priority ones)
- 🟡 **Most L2 bugs and enhancements**

### Low Priority (Nice to Have):
- ⭐ **Level 3** - Bonus territory, don't stress if we don't get here

### Instructor's Expectation:
> **"Do as much as you can with good quality. It's okay if you don't finish everything!"**

**Translation**:
- Better to complete 7-8 tasks really well than rush through 20 poorly
- Quality code with testing > quantity of features
- Good team collaboration > individual hero work
- Learning the brownfield process is the real goal

---

## Important Notes

✅ **DO:**
- Claim tasks you're genuinely interested in
- Create your own branch with your initials
- Check reference branches when stuck (after 2 hours)
- Test thoroughly before creating PR
- Update Slack when claiming/completing tasks
- Review teammates' PRs promptly (within 24 hours)
- Ask for help when blocked (don't suffer in silence!)
- Swap tasks if you're really stuck (communicate with team)

❌ **DON'T:**
- Work directly on reference branches (bug-l1-*, enhancement-l1-*)
- Merge to base-version (use team1-level-1-integration instead)
- Copy code blindly from reference branches (learn from them!)
- Work in isolation - communicate often!
- Let blockers sit for more than 4 hours
- Over-commit to too many tasks at once
- Feel bad if you don't finish everything (seriously!)

---

## Quick Win Strategies

**For Maximum Team Velocity**:

1. **Start with bugs** - Usually faster than enhancements
2. **Pair up on complex tasks** - Two heads better than one
3. **Review PRs quickly** - Don't let PRs sit idle
4. **Use reference branches** - They're there to help you
5. **Test in parallel** - While PR is in review, start next task
6. **Communicate blockers early** - Team can help unblock
7. **Celebrate completions** - Keep morale up! 🎉

---

**Last Updated**: Team formation (Day 0)  
**Next Review**: End of Day 3 (assess L1 progress, plan L2 timing)  
**Questions?** Ask in Slack #team1-questions

