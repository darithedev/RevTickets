#### **Level 2 : Imporvement & Bugs (AI Assisted)**

### **Objective**

To practice **brownfield development at Level 2**, where participants fix **moderate complexity bugs** and implement **improvements** in an existing codebase, leveraging **Cursor IDE’s AI assistance** to accelerate development.

### **Requirements**

* Cursor IDE installed and connected with GitHub repo.  
* Repo branches provided:  
  * level-1-complete (base for this activity).  
  * bug-l2-\* and improvement-l2-\* (reference solutions).  
  * level-2-complete (for validation).  
* Clear scope definition of **L2 improvements & bugs**:  
  * **Improvements** → moderate feature upgrades (e.g., better error handling, optimizing search, improving UI responsiveness).  
  * **Bugs** → harder-to-reproduce issues requiring debugging tools/logs (e.g., race condition in async request, caching mismatch).

### **Steps**

**1\. Setup & Sync**

* Clone repo & checkout level-1-complete.  
* Open project in **Cursor IDE**.  
* Sync with GitHub and create a working branch feature-l2-changes.

**2\. Analyze & Plan**

* Review **list of L2 bugs & improvements**.  
* Use Cursor’s **Command Prompts** to:  
  * Generate a **summary of affected files**.  
  * Locate **entry points** for each bug/enhancement.  
  * Draft an **implementation plan** for each task.

**3\. Resolve Bugs (with AI assistance)**

* Use Cursor IDE’s **inline debugging \+ explain code** features to identify the cause of issues.  
* Apply the recommended fix, validate correctness by **rerunning tests**.

**4\. Implement Improvements**

* Use Cursor’s **“generate code changes”** on specific functions/components.  
* Verify correctness with manual and automated testing.

**5\. Validation**

* Compare with level-2-complete branch for coverage.

**6\. Version Control & Delivery**

* Stage changes with focused commits (improvement: optimized DB query, fix: race condition in job queue).  
* Push branch to GitHub and submit PR.

### **Expected Outcome**

* All **Level 2 bugs fixed** and **improvements implemented**.  
* Demonstrated use of **Cursor IDE AI features** (explain code, suggest fixes, generate changes).  
* Clean commits & branch workflow.  
* Working project aligned with level-2-complete.

References  
 Features-&-Bugs  
