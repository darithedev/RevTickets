# Team 1 - RevTickets Brownfield Development Strategy

## 📋 Executive Summary

**Project**: RevTickets Enterprise Ticketing System Enhancement  
**Type**: Brownfield Development (working with existing MVP codebase)  
**Team**: Team 1 - 5 Members  
**Timeline**: 6 days total (flexible split between L1 & L2)  
**Integration Branches**: 
- Level 1: `team1-level-1-integration`
- Level 2: `team1-level-2-integration`  
**Base Branch**: `base-version` (MVP foundation)

**Goal**: Complete as many bugs and enhancements as possible across Level 1 and Level 2, with Level 3 as bonus if time permits. Focus on quality over quantity - it's okay if we don't finish everything!

**Important Note**: Instructor understands the tight timeline. Priority is doing good work on what we can accomplish, not rushing through everything.

---

## 🎯 Project Structure Understanding

### What is Brownfield Development?
Working on an **existing codebase** (not greenfield/from scratch):
- ✅ Analyze existing code before changing
- ✅ Make minimal, targeted changes
- ✅ Don't refactor unnecessarily
- ✅ Test that you don't break existing features
- ✅ Learn from existing patterns

### Three Levels of Complexity

**Level 1 (L1)**: Critical bugs and small enhancements  
- 5 bugs + 5 enhancements = 10 tasks
- Target timeline: 3-4 days (flexible)
- Compare with: `level-1-complete` branch
- **Priority: High** - Focus here first

**Level 2 (L2)**: More complex bugs and features (AI-assisted)  
- 5 bugs + 5 enhancements = 10 tasks
- Target timeline: 2-3 days (flexible)
- Based on `level-1-complete` as starting point
- Compare with: `level-2-complete` branch
- **Priority: Medium** - Complete what we can

**Level 3 (L3)**: Advanced features and architectural improvements ⭐ BONUS  
- Advanced AI features, n8n integration
- Cross-module dependencies
- **Priority: Low** - Only if time permits after L1 & L2
- **No pressure** - This is stretch goal territory

### Realistic Expectations

**What Success Looks Like**:
- ✅ Complete most of L1 bugs and critical enhancements
- ✅ Make good progress on L2 
- ✅ High-quality code with proper testing
- ✅ Good team collaboration and communication
- ✅ Learning brownfield development practices

**It's Okay If**:
- We don't complete every single bug/enhancement
- We prioritize critical features over nice-to-haves
- We focus on quality over quantity
- L3 doesn't happen (it's a bonus!)

---

## 🌳 Git Workflow Strategy

### Branch Structure

```
base-version (origin) ← MVP starting point (DO NOT MODIFY)
    ↓
team1-level-1-integration (origin) ← Team 1's integration branch
    ↑
    ├── bug-l1-kb-search-failure-JS (Member 3) → PR #1
    ├── bug-l1-navigation-broken-links-AM (Member 2) → PR #2
    ├── enhancement-l1-ai-ticket-summary-TL (Member 1) → PR #3
    ├── bug-l1-comment-timezone-PK (Member 4) → PR #4
    └── enhancement-l1-comment-editing-PK (Member 4) → PR #5
    
After all L1 work merged:
team1-level-1-integration → Compare with level-1-complete (reference)

For Level 2:
level-1-complete (starting point)
    ↓
team1-level-2-integration
    ↑
    ├── bug-l2-*-[INITIALS]
    └── enhancement-l2-*-[INITIALS]
```

### Reference Branches (Instructor Provided)

**DO NOT work directly on these branches!** They are:
- ✅ Reference solutions to check when stuck
- ✅ Examples of expected changes
- ✅ Validation checkpoints

**Available Reference Branches:**
- `bug-l1-*` - Individual bug solutions for L1
- `enhancement-l1-*` - Individual enhancement solutions for L1
- `level-1-complete` - Complete L1 solution
- `level-2-complete` - Complete L2 solution
- Similar branches for L2 bugs/enhancements

**How to use reference branches:**
```bash
# See what files changed
git diff base-version..bug-l1-kb-search-failure --name-only

# See actual code changes
git diff base-version..bug-l1-kb-search-failure

# Temporarily checkout to explore (DO NOT COMMIT HERE)
git checkout bug-l1-kb-search-failure
# Look around, understand approach
# Return to your branch
git checkout bug-l1-kb-search-failure-[YOUR-INITIALS]
```

---

## 👥 Team Structure & Roles

**Task Selection Model**: Team members choose tasks based on their interests and expertise (first-come-first-served). Announce your selection in Slack to avoid duplication.

### Member 1: Team Lead / Coordinator
**Suggested Expertise**: Full-Stack (comfortable with both frontend & backend)

**Responsibilities**:
- Overall project coordination and timeline management
- PR reviews and final approvals
- Merge management for integration branches
- Unblocking team members when stuck
- Facilitating daily standups
- Final validation with reference branches
- Tracking team progress

**Suggested Tasks** (examples - can choose others):
- Bug fixes that span frontend and backend
- AI-related enhancements (if comfortable with LangChain)
- Complex integration tasks

**Daily Time Commitment**: ~6-8 hours + coordination overhead

---

### Member 2: Frontend Specialist (suggested)
**Suggested Expertise**: Strong in React, Next.js, TypeScript, UI/UX

**Responsibilities**:
- Frontend bug fixes and enhancements
- UI/UX consistency guidance
- Frontend code reviews
- Component development
- Helping others with frontend questions

**Suggested Tasks** (examples - can choose others):
- UI/navigation bugs
- Frontend enhancements (search, filtering, etc.)
- Component improvements
- Responsive design issues

**Daily Time Commitment**: ~6-8 hours

---

### Member 3: Backend Specialist (suggested)
**Suggested Expertise**: Strong in Python, FastAPI, MongoDB, APIs

**Responsibilities**:
- Backend bug fixes and enhancements
- API endpoint development
- Backend code reviews
- Service layer improvements
- Helping others with backend questions

**Suggested Tasks** (examples - can choose others):
- API/database bugs
- Backend enhancements
- AI/LangChain integration (if interested)
- Service layer improvements

**Daily Time Commitment**: ~6-8 hours

---

### Member 4: Full-Stack Developer
**Suggested Expertise**: Comfortable with both, maybe frontend-leaning

**Responsibilities**:
- Supporting both frontend and backend work
- Flexible task picking based on team needs
- Testing and QA support
- Documentation

**Suggested Tasks** (examples - can choose others):
- Medium complexity bugs (frontend or backend)
- Enhancements that match your interest
- Tasks that others haven't picked yet
- Testing and integration work

**Daily Time Commitment**: ~6-8 hours

---

### Member 5: Full-Stack Developer
**Suggested Expertise**: Comfortable with both, maybe backend-leaning

**Responsibilities**:
- Supporting both frontend and backend work
- Flexible task picking based on team needs
- Testing and QA support
- Documentation

**Suggested Tasks** (examples - can choose others):
- Medium complexity bugs (frontend or backend)
- Enhancements that match your interest
- Tasks that others haven't picked yet
- Testing and integration work

**Daily Time Commitment**: ~6-8 hours

---

### Role Assignment

**On Day 1**, team should discuss:
1. Who wants to be Team Lead (Member 1)?
2. Who prefers frontend vs backend vs both?
3. Any specific task preferences?
4. Communication style and availability

**Flexible Roles**: These are suggestions! If everyone is full-stack, that's fine. Adjust based on your actual team's strengths.

---

## 📅 6-Day Timeline (Level 1 + Level 2)

### Suggested Timeline Split

**Option A (Aggressive on L1)**:
- Days 1-4: Level 1 (setup + 5 bugs + 5 enhancements)
- Days 5-6: Level 2 (5 bugs + 5 enhancements)

**Option B (Balanced)**:
- Days 1-3: Level 1 (setup + critical bugs + key enhancements)
- Days 4-6: Level 2 (complex bugs + AI features)

**Note**: Team should decide on Day 2 based on L1 progress. Flexibility is key!

---

### Day 1: Setup, Team Formation & Task Selection
**All Members** (3-4 hours):
- ✅ Clone repository
- ✅ Checkout `base-version` branch
- ✅ Run `docker-compose up --build` and verify system works
- ✅ Test demo login credentials
- ✅ Explore codebase using Cursor Chat
- ✅ Review task assignments
- ✅ Join Slack channels

**Team Lead** (additional 2 hours):
- ✅ Create `team1-level-1-integration` branch
- ✅ Set up Slack workspace/channels
- ✅ Review team strategy with members
- ✅ Ensure everyone understands workflow

**Team Task Selection Session** (1-2 hours):
- Review available Level 1 bugs and enhancements (see Task-Assignments.md)
- Each member declares their first task choice in Slack
- Team Lead tracks selections to avoid duplication
- Aim for 2 tasks per person initially (1 bug + 1 enhancement)

**End of Day 1 Deliverable**: 
- ✅ Everyone has working environment
- ✅ Tasks are claimed and tracked
- ✅ Team Lead identified
- ✅ Slack channels set up

---

### Day 2-3: Level 1 - Parallel Bug Fixing & Enhancements
**All Members** (6-8 hours each day):

**Focus**: Get as many L1 bugs fixed as possible

**Work Pattern**:
1. Pick your first task (bug or enhancement)
2. Create branch: `bug-l1-[task-name]-[INITIALS]` from `base-version`
3. Work on it (use reference branches if stuck)
4. Create PR to `team1-level-1-integration`
5. Post in Slack for review
6. While waiting for review, pick next task or help review others' PRs
7. **Don't wait idle** - keep moving!

**Task Selection Strategy**:
- Start with bugs (usually quicker than enhancements)
- Pick tasks matching your expertise
- If someone is stuck on a task for 4+ hours, team can discuss swapping
- Update Slack when you claim a new task

**Morning Standup** (in Slack):
```
**Day X - [Name]**
✅ Yesterday: [Completed tasks]
🔨 Today: [Current task]  
📋 Claimed: [List your claimed tasks]
🚫 Blockers: [Issues or None]
```

**Day 2-3 Goals**:
- Minimum: 5 bugs fixed (1 per person)
- Stretch: 5 bugs + start on enhancements
- **Decision point end of Day 3**: Are we ready for L2, or need Day 4 for L1?

---

### Day 4: L1 Completion OR Start L2 (Team Decision)

**Team assesses progress:**

**If L1 nearly complete** (most bugs + some enhancements done):
- Finish remaining L1 tasks
- Start validation with `level-1-complete`
- Begin looking at L2 tasks
- Create `team1-level-2-integration` branch from `level-1-complete`

**If L1 needs more time**:
- Continue L1 enhancements
- Focus on critical features first
- Defer nice-to-have enhancements
- Plan to start L2 on Day 5

**Flexibility is key!** Quality > completing everything.

---

### Day 5-6: Level 2 Work

**Setup** (30 mins):
```bash
# Create L2 integration branch
git checkout level-1-complete
git pull origin level-1-complete
git checkout -b team1-level-2-integration
git push origin team1-level-2-integration
```

**Task Selection for L2**:
- Same process: team members choose tasks
- L2 is more complex - may take longer
- AI-assisted per spec (use Cursor IDE features)
- Prioritize bugs over enhancements if time is tight

**L2 Available Tasks**:
- 5 bugs: ai-tags-title-only, assignment-workload-ignored, file-size-display, kb-edit-content-missing, sla-weekend-calculation
- 5 enhancements: ai-agent-assignment, ai-kb-tags, file-attachments, kb-edit, sla-automation

**Realistic L2 Goals** (2 days):
- Minimum: 3-5 bugs fixed
- Stretch: 5 bugs + 2-3 enhancements
- **It's okay to not finish all L2 tasks!**

**End of Day 6**:
- Complete whatever L2 work is done
- Compare with `level-2-complete`
- Document what was accomplished
- Team retrospective

---

### Level 3 (Bonus - if time permits)

**Only consider L3 if**:
- L1 is completely done
- L2 has good progress (most bugs fixed)
- Team is ahead of schedule
- Team has energy for more

**L3 tasks are complex**: n8n integration, advanced AI features
**Recommendation**: Focus on doing L1 & L2 well rather than rushing into L3

---

## 🔄 Detailed Workflow for Each Task

### Step-by-Step: Fixing a Bug

**Example: bug-l1-kb-search-failure**

#### 1. Create Your Branch
```bash
git checkout base-version
git pull origin base-version
git checkout -b bug-l1-kb-search-failure-JS  # JS = your initials
```

#### 2. Reproduce the Bug
```bash
# Start the application
docker-compose up --build

# Navigate to Knowledge Base search
# Try searching for known article titles
# Confirm bug exists: search returns no results
```

#### 3. Analyze Root Cause
**Questions to ask**:
- Is the search query reaching the backend?
- Is the backend processing it correctly?
- Is the database query correct?
- Are there encoding/special character issues?

**Tools**:
- Browser DevTools Network tab
- Backend logs: `docker-compose logs -f backend`
- Add console.log/print statements
- Check similar working features

#### 4. Check Reference Branch (if stuck after 2 hours)
```bash
# See what files were changed in reference solution
git diff base-version..bug-l1-kb-search-failure --name-only

# Output might show:
# backend/src/services/article_service.py
# frontend/app/knowledge-base/page.tsx

# See the actual changes
git diff base-version..bug-l1-kb-search-failure backend/src/services/article_service.py
```

#### 5. Implement Fix
**Brownfield Principle**: Modify ONLY what's necessary
```python
# Example: backend/src/services/article_service.py

# ❌ DON'T refactor entire service
# ✅ DO fix just the search method

async def search_articles(self, query: str):
    # Fix: use case-insensitive regex search
    articles = await Article.find(
        Article.title.regex(query, "i")  # "i" for case-insensitive
    ).to_list()
    return articles
```

#### 6. Test Your Fix
```bash
# Restart services
docker-compose down
docker-compose up --build

# Test cases:
# ✅ Search with exact title
# ✅ Search with partial title  
# ✅ Search with different casing
# ✅ Search with special characters
# ✅ Empty search
# ✅ No results scenario
```

#### 7. Commit Changes
```bash
# Stage only modified files
git add backend/src/services/article_service.py

# Clear commit message
git commit -m "fix: resolve KB search failure with case-insensitive regex

- Updated article search to use case-insensitive regex
- Handles partial matches and special characters
- Tested with various search inputs

Fixes bug-l1-kb-search-failure"
```

#### 8. Push and Create PR
```bash
git push origin bug-l1-kb-search-failure-JS
```

**On GitHub**:
- Click "Create Pull Request"
- **Base**: `team1-level-1-integration`
- **Compare**: `bug-l1-kb-search-failure-JS`
- **Title**: `fix: resolve KB search failure`
- **Description**:
```markdown
## Bug Fixed
bug-l1-kb-search-failure - Knowledge Base search returning no results

## Root Cause
Search query was using exact match instead of regex pattern matching

## Changes Made
- Updated `article_service.py` search method to use case-insensitive regex
- Tested with various search inputs (exact, partial, special chars)

## Files Modified
- `backend/src/services/article_service.py`

## Testing
- [x] Exact title match works
- [x] Partial title match works
- [x] Case-insensitive search works
- [x] Special characters handled
- [x] Empty search shows all articles
- [x] No results message displays correctly

## How to Test
1. Start application
2. Navigate to Knowledge Base
3. Search for "Support" (should return results)
4. Search for "support" (should also return results)
5. Search for "xyz123" (should show no results message)

## Screenshots
[Add screenshots if helpful]
```

- Request reviewers: At least one team member
- Post in Slack:
```
✅ PR Ready for Review
🐛 Bug: KB search failure
📎 Link: [PR #15]
🔍 Reviewers: @Member2 @Member3
```

#### 9. Address Code Review Feedback
When reviewer comments:
```bash
# Make requested changes
git add [files]
git commit -m "fix: address PR feedback - add error handling"
git push origin bug-l1-kb-search-failure-JS
```

#### 10. After Merge
```bash
# Switch to integration branch
git checkout team1-level-1-integration
git pull origin team1-level-1-integration

# Delete your feature branch
git branch -d bug-l1-kb-search-failure-JS

# Update Slack
✅ Merged: bug-l1-kb-search-failure
📎 PR: #15
🎉 Moving to next task: enhancement-l1-ai-closing-suggestions
```

---

### Step-by-Step: Implementing an Enhancement

**Example: enhancement-l1-kb-title-search**

#### 1. Understand Requirements
From task assignments:
- Add search input to KB page
- Case-insensitive search by title
- Display results with highlighting
- Clear search functionality

#### 2. Check Reference Branch
```bash
git diff base-version..enhancement-l1-kb-title-search --name-only
```

#### 3. Draft Implementation Plan
(Document in PR description or comments)
```markdown
## Implementation Plan

### Backend Changes
1. Add search endpoint to article service
   - `GET /api/v1/articles/search?q={query}`
   - Use MongoDB text search or regex
   - Return matching articles

### Frontend Changes
1. Add search input component to KB page
2. Implement debounced search (300ms delay)
3. Display search results
4. Add clear search button
5. Highlight matching text

### Files to Modify
- Backend: `src/services/article_service.py`
- Backend: `src/api/v1/routes/article.py`
- Frontend: `app/knowledge-base/page.tsx`
- Frontend: `src/lib/api/articles.ts`
```

#### 4. Implement Backend First
```python
# backend/src/api/v1/routes/article.py

@router.get("/search")
async def search_articles(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user)
):
    """Search articles by title"""
    articles = await article_service.search_by_title(q)
    return articles
```

#### 5. Implement Frontend
```typescript
// app/knowledge-base/page.tsx

const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);

const handleSearch = useDebouncedCallback(
  async (query: string) => {
    if (query.trim()) {
      const results = await searchArticles(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  },
  300
);
```

#### 6. Test End-to-End
- Search with various inputs
- Verify debouncing works
- Test clear button
- Test no results scenario
- Test responsive design

#### 7. Follow same PR process as bugs

---

## 📞 Communication Protocol (Slack)

### Slack Channel Structure

#### #team1-general
**Purpose**: General team discussions, announcements, celebrations

**Usage**:
```
"Great job on that PR, @Member2!"
"FYI: Reference branch for AI summaries is really helpful"
"Let's do a quick sync call at 3pm"
```

---

#### #team1-daily-standup  
**Purpose**: **Structured daily status updates**

**Required Format** (Post every morning):
```
**Day X - [Your Name]**
✅ Yesterday: [What you completed]
🔨 Today: [What you're working on]
🚫 Blockers: [Any issues or None]
```

**Example**:
```
**Day 3 - John Smith**
✅ Yesterday: Fixed bug-l1-kb-search-failure, created PR #15
🔨 Today: Addressing PR feedback, starting enhancement-l1-ai-closing-suggestions
🚫 Blockers: None
```

**Rules**:
- Post by 10 AM (or your agreed start time)
- Be specific about what you accomplished
- Call out blockers immediately
- Keep it concise

---

#### #team1-questions
**Purpose**: Technical questions, asking for help

**Usage**:
```
"Has anyone worked with LangChain chains before? Need help with summary generation"

"Getting this error in article_service.py: [error]. Any ideas?"

"Can someone explain how the rich text editor component works?"
```

**Response expectations**: Within 4 hours during work day

---

#### #team1-prs
**Purpose**: PR notifications and review requests

**Usage**:
```
✅ PR Ready for Review
🐛 Bug: KB search failure  
📎 Link: https://github.com/.../pull/15
🔍 Reviewers: @Member2 @Member3
💬 Description: Fixed case-sensitive search issue
```

**When PR is reviewed**:
```
👀 Reviewed PR #15
✅ Approved
💡 Small suggestion on error handling
```

---

### Response Time Expectations

| Channel | Expected Response Time | Priority |
|---------|----------------------|----------|
| #team1-daily-standup | Same day | Low (read-only) |
| #team1-questions | 4 hours | High |
| #team1-prs | 24 hours for review | High |
| #team1-general | Best effort | Low |
| Direct messages | 2 hours | High |

### When You're Blocked

**Escalation Path**:
1. **0-2 hours**: Try to solve yourself (debug, Google, check docs)
2. **After 2 hours**: Check reference branch
3. **After 3 hours**: Post in #team1-questions
4. **After 4 hours**: Tag team lead in questions channel
5. **Critical blocker**: Direct message team lead immediately

---

## 🎯 Code Review Guidelines

### For PR Authors

**Before Creating PR**:
- [ ] Code works locally
- [ ] Tested with `docker-compose up --build`
- [ ] Only necessary files modified
- [ ] No console.logs or debug code left
- [ ] Commit messages are clear
- [ ] PR description is complete

**PR Description Template**:
```markdown
## Type
- [ ] Bug Fix
- [ ] Enhancement
- [ ] Documentation

## Description
[Clear description of what and why]

## Changes Made
- List of specific changes
- Why each change was necessary

## Files Modified
- file1.py - reason
- file2.tsx - reason

## Testing
- [ ] Test case 1
- [ ] Test case 2
- [ ] Regression testing done

## How to Test
Step-by-step instructions for reviewer

## Screenshots
[If UI changes]

## Notes for Reviewers
[Anything specific to look at]
```

---

### For Reviewers

**Review Checklist**:
- [ ] Does code solve the stated problem?
- [ ] Are only necessary files modified?
- [ ] Is code readable and maintainable?
- [ ] Are there proper error handling?
- [ ] Are edge cases considered?
- [ ] Does it follow existing code patterns?
- [ ] Are there any security concerns?
- [ ] Is brownfield principle followed (minimal changes)?

**Review Comments Should Be**:
- ✅ Constructive: "Consider adding error handling here for X case"
- ✅ Specific: "Line 45: this could cause issue when..."
- ✅ Educational: "Great fix! FYI, here's why this works..."
- ❌ Not vague: "This looks wrong"
- ❌ Not harsh: "This is terrible code"

**Review Response Time**:
- PRs should be reviewed within 24 hours
- Bugs marked "urgent" within 12 hours
- Team Lead does final approval before merge

---

## 🚨 Important Guidelines & Best Practices

### Brownfield Development Principles

#### 1. Minimal Change Approach
✅ **DO**:
- Change only files directly related to bug/feature
- Follow existing code patterns
- Use existing utilities and components
- Keep consistency with codebase

❌ **DON'T**:
- Refactor unrelated code
- Change working features
- Introduce new patterns unnecessarily
- Modify coding style of existing code

#### 2. Understand Before Changing
✅ **DO**:
- Read existing code thoroughly
- Trace data flow end-to-end
- Check related components
- Review similar implementations

❌ **DON'T**:
- Jump straight to coding
- Make assumptions about code behavior
- Skip understanding dependencies

#### 3. Test Thoroughly
✅ **DO**:
- Test your specific fix/feature
- Test related functionality (regression)
- Test with different user roles
- Test edge cases

❌ **DON'T**:
- Test only happy path
- Skip regression testing
- Assume it works if it compiles

---

### Git Best Practices

**Good Commit Messages**:
```bash
fix: resolve KB search returning empty results for partial matches

feat: add AI-powered ticket summary generation with LangChain

refactor: simplify article search logic for better performance

docs: update README with Level 1 completion status
```

**Bad Commit Messages**:
```bash
fixed stuff
update
changes
wip
```

**Commit Message Format**:
```
<type>: <short summary>

<optional body with details>
<why this change was needed>
<what was changed>

<optional footer with issue references>
```

**Types**: fix, feat, docs, style, refactor, test, chore

---

### When to Check Reference Branches

✅ **Good times**:
- After trying for 2+ hours
- To understand scope of changes
- To validate your approach
- To learn different techniques

❌ **Bad times**:
- Before attempting yourself
- To copy-paste solution
- Every 5 minutes when stuck

**How to learn from reference branches**:
1. Try to solve yourself first
2. Get stuck, check reference
3. Understand the approach (don't just copy)
4. Implement in your own words
5. Test and validate

---

## 📊 Success Criteria

### Level 1 Completion

**Functionality (40%)**:
- [ ] All 5 bugs fixed and working
- [ ] All 5 enhancements implemented and working
- [ ] System works end-to-end without errors
- [ ] All features tested with different user roles
- [ ] No regressions in existing features

**Code Quality (30%)**:
- [ ] Code follows existing patterns
- [ ] Minimal and focused changes
- [ ] Proper error handling
- [ ] Clean commit history
- [ ] Documentation updated where needed

**Team Process (20%)**:
- [ ] Daily standups completed
- [ ] All PRs reviewed by team members
- [ ] Good communication in Slack
- [ ] Blockers addressed promptly
- [ ] Task tracking maintained

**Validation (10%)**:
- [ ] Compared with `level-1-complete`
- [ ] Documented any differences
- [ ] All team members tested integrated system
- [ ] Lessons learned documented

---

## 🔧 Technical Setup Reference

### Initial Setup (Day 1)
```bash
# Clone repository (if not done)
cd C:\Users\fly2s\Documents\ASU\MyAIcourse\MyProjects\MyRepoSandbox\brownfield
git clone https://github.com/Revature/RevTickets.git
cd RevTickets

# Checkout base branch
git checkout base-version
git pull origin base-version

# Start development environment
docker-compose up --build
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **MongoDB**: mongodb://localhost:27017

### Demo Credentials

**Regular Users**:
- john.doe@company.com / password123
- jane.smith@company.com / password123
- mike.johnson@company.com / password123

**Agents (Full Access)**:
- sarah.wilson@company.com / password123
- david.brown@company.com / password123
- lisa.davis@company.com / password123

### Useful Commands
```bash
# Start services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Create branch
git checkout -b bug-l1-task-name-INITIALS

# Check branch
git branch

# Stage changes
git add [specific-files]

# Commit
git commit -m "fix: description"

# Push
git push origin your-branch-name

# Pull latest
git pull origin base-version

# Compare branches
git diff branch1..branch2
git diff branch1..branch2 --name-only
```

---

## 📚 Resources

### Documentation
- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **MongoDB**: https://docs.mongodb.com/
- **LangChain**: https://python.langchain.com/docs/
- **Beanie ODM**: https://beanie-odm.dev/

### Project Specific
- **Wiki**: https://github.com/Revature/RevTickets/wiki/Enhancements-&-Bugs
- **Instructor Specs**: `../brownfield-proj/` folder
- **Task Assignments**: `Task-Assignments.md`

### Tools
- **Cursor IDE**: Use Cursor Chat to explore codebase
- **GitHub Desktop**: For visual Git management
- **Postman/Thunder Client**: API testing
- **MongoDB Compass**: Database inspection

---

## 🎓 Learning Objectives

By completing this project, our team will:

**Technical Skills**:
- ✅ Work with existing codebases (brownfield)
- ✅ Fix bugs systematically
- ✅ Implement features without over-engineering
- ✅ Use FastAPI and Next.js professionally
- ✅ Work with MongoDB and ODM
- ✅ Integrate AI features with LangChain
- ✅ Use Docker for development

**Collaboration Skills**:
- ✅ Remote team collaboration
- ✅ Code review practices
- ✅ Git workflow in team environment
- ✅ Effective communication via Slack
- ✅ Task management and time estimation

**Professional Skills**:
- ✅ Following established patterns
- ✅ Minimal change approach
- ✅ Systematic testing
- ✅ Working with reference implementations
- ✅ Balancing speed vs quality

---

## 🚀 Next Steps After Level 1

### Level 2 Preparation
1. Create `team1-level-2-integration` from `level-1-complete`
2. Reassign tasks based on L1 performance
3. New timeline: ~5-6 days
4. Similar workflow but with AI assistance

### Level 3 Preparation
1. Advanced features and n8n integration
2. Cross-module dependencies
3. Architectural improvements
4. AI-driven features

---

## 💡 Tips for Success

1. **Communicate Early and Often**: Don't wait until you're completely stuck
2. **Use Reference Branches Wisely**: Learn from them, don't copy blindly
3. **Test, Test, Test**: Brownfield means don't break existing features
4. **Keep Changes Minimal**: Resist urge to "improve" unrelated code
5. **Review Thoroughly**: Code reviews catch issues early
6. **Stay on Timeline**: 6 days is tight - manage time well
7. **Help Each Other**: We succeed as a team
8. **Document as You Go**: Future you will thank present you
9. **Celebrate Wins**: Acknowledge progress and completed PRs
10. **Learn from Mistakes**: Retrospect and improve

---

**Document Version**: 1.0  
**Created**: Team formation  
**Last Updated**: [Date]  
**Maintained By**: Team Lead (Member 1)  

---

**Let's build something great, Team 1! 🚀**

Questions? Ask in #team1-questions  
Stuck? Check reference branches  
Confused? Tag @TeamLead in Slack  

**Remember**: We're here to learn, collaborate, and deliver quality work. Communication is key! 💪

