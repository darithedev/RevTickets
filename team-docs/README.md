# Team 1 Documentation

## 📋 Quick Links

- **Strategy Document**: [Team1-Work-Strategy.md](./Team1-Work-Strategy.md) - Complete brownfield development workflow
- **Task Assignments**: [Task-Assignments.md](./Task-Assignments.md) - Level 1, 2, 3 task breakdown
- **Daily Standups**: Slack **#team1-daily-standup** channel
- **Instructor Specs**: [../brownfield-proj/](../brownfield-proj/) - All project specifications
- **Reference Branches**: 
  - `level-1-complete` - Instructor's L1 solution
  - `level-2-complete` - Instructor's L2 solution
  - Individual `bug-l1-*` and `enhancement-l1-*` branches

## 🔄 Daily Workflow

### 1. Check Your Assignments
- Open [Task-Assignments.md](./Task-Assignments.md)
- Note your assigned bugs/enhancements

### 2. Create Your Branch
```bash
git checkout base-version
git pull origin base-version
git checkout -b bug-l1-[task-name]-[YOUR-INITIALS]
```

### 3. Post Morning Standup in Slack
```
**Day X - [Your Name]**
✅ Yesterday: [What you completed]
🔨 Today: [What you're working on]
🚫 Blockers: [Any issues or None]
```

### 4. Work on Your Task
- Reproduce bug or understand enhancement
- Check reference branch if stuck
- Implement minimal changes
- Test with `docker-compose up --build`

### 5. Create Pull Request
```bash
git add [specific-files]
git commit -m "fix: clear description"
git push origin your-branch-name
```
- Create PR to `team1-level-1-integration`
- Request review from at least one team member
- Post PR link in Slack

### 6. Code Review
- Review others' PRs within 24 hours
- Provide constructive feedback
- Approve when satisfied

### 7. Post Completion Update in Slack
```
✅ Completed: bug-l1-kb-search-JS
📎 PR: #15
🔍 Ready for review!
```

## 🎯 Success Criteria

- All Level 1 bugs fixed
- All Level 1 enhancements implemented
- Clean commit history
- All PRs reviewed and merged
- System works end-to-end
- Compare with `level-1-complete` for validation

## 📞 Communication

### Slack Channels (Set these up)
- **#team1-general** - General team discussion
- **#team1-daily-standup** - Daily status updates (structured)
- **#team1-questions** - Technical questions and help
- **#team1-prs** - PR notifications and reviews

### Response Time Expectations
- Slack messages: Within 4 hours during work day
- PR reviews: Within 24 hours
- Blockers: Immediate attention in Slack

## 🚨 When You're Blocked

1. **Try for 2 hours** - Debug, Google, check docs
2. **Check reference branch** - See instructor's approach
3. **Ask in Slack #team1-questions** - Team can help
4. **Tag team lead** - If still stuck after 4 hours

## 📚 Key Resources

- **Project Wiki**: https://github.com/Revature/RevTickets/wiki/Enhancements-&-Bugs
- **Frontend Docs**: Next.js 15 - https://nextjs.org/docs
- **Backend Docs**: FastAPI - https://fastapi.tiangolo.com/
- **Database**: MongoDB - https://docs.mongodb.com/
- **AI Integration**: LangChain - https://python.langchain.com/docs/

## 🎓 Team Learning Philosophy

- **Learn by doing** - Try first, then check references
- **Share knowledge** - Post solutions and learnings in Slack
- **Review thoughtfully** - Code reviews are learning opportunities
- **Brownfield mindset** - Minimal changes, maximum impact
- **Help each other** - We succeed as a team

---

**Timeline**: 6 days for Level 1  
**Integration Branch**: `team1-level-1-integration`  
**Base Branch**: `base-version`  
**Let's build something great! 🚀**

