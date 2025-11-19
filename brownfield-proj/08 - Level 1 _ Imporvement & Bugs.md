#### **Level 1 : Imporvement & Bugs**

###  

**Objective**

To simulate a **brownfield development workflow** where developers work on existing code, fix bugs, and add enhancements while ensuring minimal and precise changes to the codebase.

**Requirements**

* Local environment set up with:  
  * Git installed  
  * Python/Node.js runtime (depending on project stack)  
* Access to project repository with the following branches:  
  * base-version (MVP starting point)  
  * bug-l1-\* and enhancement-l1-\* (as references)  
  * level-1-complete (for comparison after completion)  
* Clear understanding of **modifying only the required files** and sections, not touching unrelated parts of the project.

**Steps**

1. **Clone and Checkout**  
   1. Clone the repo and checkout base-version branch.  
   2. Set up the project locally (install dependencies, run initial migrations, etc.).  
2. **Analyze Requirements**  
   1. Review the **Level 1 bugs** and **enhancements** list provided.  
   2. Identify affected modules/files by reading through docs, commit history, or branch references (bug-l1-\*, enhancement-l1-\*).  
3. **Resolve Bugs**  
   1. For each bug, locate the root cause by:  
      1. Checking logs,  
      2. Reproducing the bug locally,  
      3. Comparing with bug-l1-\* branch if stuck.  
   2. Apply minimal code changes to fix the issue.  
4. **Implement Enhancements**  
   1. Review enhancement requests (e.g., AI ticket summary, KB title search).  
   2. Plan small, incremental changes.  
   3. Ensure adherence to UI/UX guidelines provided.  
5. **Testing**  
   1. Manually test each bug fix and enhancement.  
   2. Ensure no regressions introduced.  
6. **Version Control**  
   1. Commit changes with clear, scoped commit messages (e.g., fix: KB search failure bug).  
   2. Push to a new branch feature-l1-changes for review.  
7. **Validation**  
   1. Compare your branch with level-1-complete to validate coverage of all required bugs/enhancements.

**Expected Outcome**

* A working version of the project with all **Level 1 bugs fixed** and **enhancements implemented**.  
* Clean, minimal commits showing focused changes.  
* Demonstrated ability to work without AI-assisted IDEs by relying on **manual debugging, reading, and structured development practices**.

References  
 Features-&-Bugs  
