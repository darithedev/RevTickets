#### **Introduction**

### Brownfield Development Workflow for Ticketing System

Objective

To simulate a **real-world brownfield development process** where developers incrementally enhance an existing MVP ticketing system. This helps to practice working with existing codebases, resolving bugs, implementing enhancements, and maintaining clean version control practices. By progressing through Levels 1, 2, and 3, one develops proficiency in analysing legacy systems, applying targeted fixes, and implementing scalable improvements without unnecessary code changes.

Requirements

1. **Starting Point**  
   1. Use the base-version branch as the working foundation.  
   2. Learners must not overwrite or delete existing functionality unless specified.  
2. **Level Structure**  
   1. **Level 1 (L1):**  
      Focus on critical bugs and small enhancements. Use branches prefixed with bug-l1-\* and enhancement-l1-\*.  
      After completing, compare with the reference branch level-1-complete.  
   2. **Level 2 (L2):**  
      Address more complex bugs and feature enhancements. Use branches prefixed with bug-l2-\* and enhancement-l2-\*.  
      After completing, compare with level-2-complete.  
   3. **Level 3 (L3):**  
      Tackle advanced features, cross-module dependencies, or architectural improvements.  
      Branch naming convention: bug-l3-\* and enhancement-l3-\*.  
      After completing, compare with level-3-complete.  
3. **Development Guidelines**  
   1. Modify **only the required files** and sections directly relevant to the bug or feature.  
   2. Follow **UI/UX guidelines** for consistency.  
   3. Document the implementation plan before coding.  
   4. Perform **manual testing** to confirm fixes or enhancements.  
   5. Commit changes with clear messages and open a merge request.

Workflow Steps

1. **Bug Resolution (for each bug branch)**  
   1. Analyze bug details.  
   2. Identify the minimum required file/section to modify.  
   3. Implement fix, test, and validate against expected outcome.  
2. **Feature Enhancement (for each enhancement branch)**  
   1. Review the enhancement requirement.  
   2. Draft an **implementation plan**.  
   3. Modify only necessary files and UI/UX layers.  
   4. Manually test feature end-to-end.  
3. **Progression**  
   1. Complete all **L1 bugs and enhancements** → validate against level-1-complete.  
   2. Move to **L2 branches** → validate against level-2-complete.  
   3. Finally, handle **L3 advanced requirements** → validate against level-3-complete.

Expected Outcome

* Gain experience with **brownfield development cycles**, working on pre-existing projects without over-modification.  
* Demonstrate ability to:  
  1. Fix bugs systematically.  
  2. Implement features incrementally.  
  3. Use reference branches (level-\*-complete) as checkpoints for validation.  
  4. Progress logically from MVP to production-ready system.  
* By L3, you should be comfortable with **complex system integrations, scalability challenges, and advanced AI-driven features**.

References  
 https://github.com/Revature/RevTickets/wiki/Enhancements-&-Bugs  
