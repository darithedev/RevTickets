# RevTickets Team Documentation

This folder contains essential documentation for team collaboration on the RevTickets project.

## 📄 Documents

### 1. TASK-TRACKING.md
**Purpose:** Live task tracking spreadsheet (like Excel tabs in markdown)

**What it contains:**
- All Level 1, 2, and 3 bugs and enhancements organized in tables
- Task assignments, status, priority, PR links
- Quick navigation between levels
- Progress statistics
- Instructions for claiming and updating tasks

**How to use:**
1. Browse tasks by level and type
2. Claim a task by adding your name to the "Assignee" column
3. Update "Status" as you progress
4. Add your PR link when ready for review
5. Commit and push updates so team sees your progress

**Update frequency:** Update whenever you claim, start, or complete a task

---

### 2. Bugs-and-Enhancements.md
**Purpose:** Comprehensive reference document with full implementation details

**What it contains:**
- Detailed description of every bug and enhancement
- Affected files and specific line numbers
- Learning objectives for each task
- Root causes for bugs
- Step-by-step implementation guidance
- Technology stack information
- Prerequisites and dependencies

**How to use:**
- Read before starting any task to understand requirements
- Reference while implementing to ensure completeness
- Use as a guide for PR descriptions
- Consult when stuck or need clarification

**Update frequency:** Reference only - don't modify unless instructor provides updates

---

### 3. brownfield-proj-specs/
**Purpose:** Original project specification files from instructor

**Contents:**
- Introduction to Brownfield development
- Project overview and MVP details
- Level 1, 2, and 3 specifications
- Additional implementation guidance
- Detailed requirements and context

**How to use:**
- Primary source of truth for project requirements
- Read in conjunction with Bugs-and-Enhancements.md
- Consult for context and additional details

---

## 🔄 Workflow

### Claiming a Task

1. **Choose your task** from `TASK-TRACKING.md`
2. **Read the details** in `Bugs-and-Enhancements.md`
3. **Update TASK-TRACKING.md on docs/task-track branch:**
   ```bash
   # Pull latest tracking file
   git checkout docs/task-track
   git pull origin docs/task-track
   
   # Edit TASK-TRACKING.md: Change "Not Started" to "In Progress - YourName"
   
   # Commit and push directly (NO PR!)
   git add docs/TASK-TRACKING.md
   git commit -m "docs: Claim L1-B2 - YourName"
   git push origin docs/task-track
   ```
4. **Checkout the existing task branch** from remote:
   ```bash
   git checkout bug-l1-category-update-failure
   git pull origin bug-l1-category-update-failure
   ```

### Working on a Task

1. **Implement** following the guidance in `Bugs-and-Enhancements.md`
2. **Test** your changes locally
3. **Push to your task branch:**
   ```bash
   git add .
   git commit -m "fix: your changes"
   git push origin bug-l1-category-update-failure
   ```
4. **Create a PR** to `base-version` on GitHub
5. **Update TASK-TRACKING.md with PR link:**
   ```bash
   git checkout docs/task-track
   git pull origin docs/task-track
   # Edit: Change Status to "Complete - PR #123"
   git commit -am "docs: L1-B2 ready for review - PR #123"
   git push origin docs/task-track
   ```
6. **Request review** from teammates in PR

### Completing a Task

1. **After PR is merged**, update `TASK-TRACKING.md`:
   ```bash
   git checkout docs/task-track
   git pull origin docs/task-track
   # Edit: Change Status to "Completed - PR #123"
   git commit -am "docs: L1-B2 completed and merged"
   git push origin docs/task-track
   ```
2. **Pick your next task!**

---

## 📝 Updating TASK-TRACKING.md

### Important: This file lives on `docs/task-track` branch

**Why?**
- Team members can update status directly without PRs
- Faster coordination and real-time visibility
- Avoids PR overhead for documentation updates

### Two Ways to Update:

**Method 1: Command Line (Recommended)**
```bash
# Always pull first!
git checkout docs/task-track
git pull origin docs/task-track

# Edit the file (update your task row)

# Commit and push immediately
git add docs/TASK-TRACKING.md
git commit -m "docs: Update L1-B2 status - YourName"
git push origin docs/task-track
```

**Method 2: GitHub Web Interface (Easiest)**
1. Go to: https://github.com/darithedev/RevTickets/blob/docs/task-track/docs/TASK-TRACKING.md
2. Click the "Edit" button (pencil icon)
3. Make your changes
4. Commit directly to `docs/task-track` branch

### Handling Merge Conflicts

**If your push is rejected:**
```bash
git push origin docs/task-track
# Error: Updates were rejected

# Pull to get others' changes
git pull origin docs/task-track
# Git will auto-merge if different rows edited

# If conflict on same row, resolve manually:
# 1. Open TASK-TRACKING.md
# 2. Remove conflict markers (<<<, ===, >>>)
# 3. Keep the correct version
git add docs/TASK-TRACKING.md
git commit -m "docs: Resolve merge conflict"
git push origin docs/task-track
```

**Pro Tips:**
- Edit different rows = automatic merge ✅
- Edit same row = manual resolution needed ⚠️
- Always pull before editing to minimize conflicts
- Push immediately after editing
- Communicate in Slack when claiming tasks

---

## 📊 Team Coordination

### Communication Channels

- **Slack:** For real-time updates and quick questions
  - Team Channel: https://app.slack.com/client/EBY1XTCCR/C09TD6CA6BZ
- **GitHub PRs:** For code review and technical discussion
- **This repo:** For task tracking and status updates

### Best Practices

1. **Checkout the existing task branch** from remote - branches are already created
2. **Pull latest changes** on your task branch before starting work
3. **Update TASK-TRACKING.md** promptly so team knows what's in progress
4. **One person per task** - check tracking doc before claiming
5. **Review each other's PRs** - at least one approval needed
6. **Test thoroughly** before creating PR
7. **Create PR to base-version** when ready for review
8. **Write clear PR descriptions** referencing the task ID

### Avoiding Conflicts

- **Check TASK-TRACKING.md** before claiming - someone might already be working on it
- **Communicate in Slack** if you need to switch tasks
- **Mark tasks as "Blocked"** if you're stuck so others can help
- **Don't work on multiple tasks** at once - finish one before starting another

---

## 🎯 Project Timeline

**Total Duration:** 6 days (flexible)
- **Days 1-4:** Level 1 (foundation)
- **Days 5-6:** Level 2 (intermediate)
- **Bonus:** Level 3 (if time permits)

### Priorities

1. **Critical bugs first** (marked as Critical priority)
2. **High-priority bugs** next
3. **High-priority enhancements**
4. **Medium/Low tasks** as time allows

### Level 3 Note

Level 3 tasks are **bonus** and **advanced**. Only attempt if:
- You've completed your Level 1 and 2 tasks
- You have extra time
- You're comfortable with the complexity

---

## 💡 Tips for Success

1. **Read the specs first** - understand requirements before coding
2. **Start with easier tasks** to build momentum
3. **Ask for help** if stuck > 30 minutes
4. **Test locally** before pushing
5. **Keep PRs focused** - one task per PR
6. **Update docs** as you go - don't wait until the end
7. **Learn from each other's PRs** - review code even if not assigned

---

## 🔧 Technical Setup

### Required Tools
- Git
- Docker Desktop
- Node.js 18+
- Python 3.10+
- VS Code (recommended) or Cursor

### Environment Setup
- See root `.env.example` for Docker Compose setup
- See `backend/.env.example` for local development
- Google API Key required for AI features

### Running Locally
```bash
# Start MongoDB
docker-compose up -d mongo

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📝 Document Maintenance

### Who Updates What

| Document | Who Updates | When | Purpose |
|---|---|---|---|
| TASK-TRACKING.md | **Everyone** | Frequently | Track progress |
| Bugs-and-Enhancements.md | **Reference only** | Never | Implementation guide |
| Brownfield-proj-specs/ | **Instructor only** | N/A | Requirements |
| This README | **Team lead** | As needed | Documentation |

---

## 🤝 Need Help?

1. **Check Bugs-and-Enhancements.md** for implementation details
2. **Search existing PRs** for similar work
3. **Ask in Slack** for quick questions
4. **Schedule pair programming** for complex issues
5. **Review base-version code** for examples

---

## 📌 Quick Links

- **Repository:** https://github.com/darithedev/RevTickets
- **Original Specs:** https://github.com/Revature/RevTickets/wiki/Enhancements-&-Bugs
- **Base Branch:** `base-version`
- **Task Tracking:** [TASK-TRACKING.md](./TASK-TRACKING.md)
- **Implementation Guide:** [Bugs-and-Enhancements.md](./Bugs-and-Enhancements.md)

---

**Remember:** This is a collaborative learning project. Help each other, share knowledge, and have fun building! 🚀

