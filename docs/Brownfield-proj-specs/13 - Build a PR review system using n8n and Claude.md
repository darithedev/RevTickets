#### **Build a PR review system using n8n and Claude**

### **Objective**

To design and implement an automated workflow in **n8n** that integrates with **Claude LLM** for reviewing pull requests (PRs). The workflow should automatically analyze PR descriptions, code diffs, and comments, and then provide structured feedback or approval suggestions.

### **Requirements**

1. **n8n Setup**  
   1. Access to an **n8n instance** (cloud or self-hosted).  
   2. Installed and configured **GitHub nodes** for fetching PR data.  
   3. Access to **Claude LLM node** (via API key).  
2. **Workflow Design**  
   1. Trigger: A new PR event from GitHub.  
   2. Steps:  
      1. **Fetch PR metadata** (title, description, branch).  
      2. **Fetch code diffs/files changed**.  
      3. **Send content to Claude** for analysis.  
      4. **Claude generates feedback** in structured format:  
         1. Strengths in the PR.  
         2. Issues/bugs spotted.  
         3. Suggestions for improvement.  
      5. **Post feedback** as a PR comment back to GitHub.  
3. **Claude Prompt Guidelines**  
   1. The PR review should be **concise, actionable, and constructive**.  
   2. Only highlight the most **critical improvements**.  
   3. Follow a consistent format: *Strengths, Issues, Suggestions*.

### **Expected Outcome**

* Every time a PR is created or updated, the workflow runs automatically.  
* Claude provides a **review summary** in the PR thread.  
* Reviewers can use Claude’s feedback to speed up manual reviews.  
* Ensures **faster, higher-quality reviews** while keeping developers focused.

Read in detailed view  
