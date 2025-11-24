# Ticketing System Enhancements and Bugs

**Source:** https://github.com/Revature/RevTickets/wiki/Enhancements-&-Bugs  
**Last Updated:** November 24, 2025

This document outlines all planned enhancements and bugs for the RevTickets system. It serves as a comprehensive reference for implementation details, affected files, and learning objectives.

## Document Structure

### Enhancements
- **15 total enhancements** across 3 levels of complexity
- **5 enhancements per level**
- Each enhancement in its own git branch
- Branches follow naming convention: `enhancement-l[1-3]-[feature-name]`

### Bugs
- **15 total bugs** across 3 levels of complexity
- **5 bugs per level**
- Each bug in its own git branch
- Branches follow naming convention: `bug-l[1-3]-[bug-name]`

---

# ENHANCEMENTS

## Level 1 Features (Foundation Features)

### Feature 1 - Comment Editing

- **Branch:** `enhancement-l1-comment-editing`
- **Feature Area:** Comment Management
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** Users need ability to edit their own comments within time limits
- **Description:** Allow users to edit comments they've posted within 24 hours with edit history tracking
- **Impact:** Improved user experience, reduced need for follow-up comments to fix mistakes
- **Learning Goals:** MongoDB document updates, time-based validation, frontend form handling

**Files to Modify:**
- `frontend/app/tickets/[id]/page.tsx` - Add edit functionality, edit buttons, inline editing interface, edit state management
- `frontend/src/app/shared/types/ticket.ts` - Add Comment interface fields: `edited`, `edit_count`, `edit_history`; Add `CommentEditHistory` and `UpdateComment` interfaces
- `frontend/src/lib/utils/date.ts` - Add `canEditComment()` and `getEditTimeRemaining()` functions for 24-hour validation
- `frontend/src/lib/api/tickets.ts` - Add `updateComment()` API method

**Frontend Tasks:**
- Add edit button to comment components
- Create edit form modal/inline editing
- Add edit history display
- Implement 24-hour time limit validation
- Show edited indicator on comments

---

### Feature 2 - Ticket Reopening

- **Branch:** `enhancement-l1-ticket-reopening`
- **Feature Area:** Ticket Lifecycle Management
- **Affected Roles:** Users
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** Users need ability to reopen resolved tickets for follow-up issues
- **Description:** Enable ticket reopening within 10 working days with business date calculations
- **Impact:** Better handling of recurring issues, improved customer satisfaction
- **Learning Goals:** Business date calculations, state management, complex business logic

**Files to Modify:**
- `frontend/app/tickets/[id]/page.tsx` - Add reopen ticket section, reopen confirmation modal, reopen state management and handlers
- `frontend/src/lib/utils/date.ts` - Add `canReopenTicket()`, `getReopenTimeRemaining()`, and `formatBusinessDaysFromNow()` functions for 10 business day calculations
- `frontend/src/lib/api/tickets.ts` - Add `reopenTicket()` API method

**Frontend Tasks:**
- Add "Reopen Ticket" button to closed tickets
- Implement business day calculation display
- Create reopening confirmation modal
- Update ticket status displays
- Add reopening history to ticket timeline

---

### Feature 3 - Knowledge Base Title Search

- **Branch:** `enhancement-l1-kb-title-search`
- **Feature Area:** Knowledge Base
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** Users need efficient way to find KB articles by searching titles
- **Description:** Implement frontend search interface utilizing existing backend search API with real-time search, filtering, and pagination
- **Impact:** Faster problem resolution, reduced duplicate tickets
- **Learning Goals:** Frontend search implementation, API integration, real-time search UX

**Files to Modify:**
- `frontend/app/knowledge-base/page.tsx` - Add search interface with TextInput, search state management, debounced search, search results display, clear search functionality
- `frontend/src/app/shared/components/SearchBar.tsx` - Create reusable search component
- `frontend/src/hooks/useDebounceSearch.ts` - Create debounced search hook

**Frontend Tasks:**
- Build search interface with real-time suggestions
- Create search results page with filtering
- Add search highlighting in results
- Implement pagination for search results
- Add search history/recent searches
- Integrate with existing `articlesApi.search()` method

---

### Feature 4 - AI Ticket Summary

- **Branch:** `enhancement-l1-ai-ticket-summary`
- **Feature Area:** AI Features
- **Affected Roles:** Agents
- **Technology Stack:** FastAPI, LangChain, OpenAI API, Next.js
- **Issue:** Agents need quick overview of long ticket conversations
- **Description:** Frontend implementation for AI-powered ticket summaries utilizing existing backend endpoint `/tickets/{id}/summary`
- **Impact:** Faster ticket processing, improved agent productivity
- **Learning Goals:** AI API integration, async UI handling, loading states, error handling

**Files to Modify:**
- `frontend/app/tickets/[id]/page.tsx` - Add summary section, generate summary button, summary display area, loading states
- `frontend/src/app/shared/components/AISummaryCard.tsx` - Create summary display component
- `frontend/src/lib/api/tickets.ts` - Add `generateSummary()` API method

**Frontend Tasks:**
- Add "Generate Summary" button to ticket detail page
- Create AI summary display component
- Implement loading states and animations
- Add error handling for API failures
- Show summary metadata (generated time, token count)
- Integrate with existing backend `/tickets/{id}/summary` endpoint

**Prerequisites:**
- Google API Key must be configured in backend `.env`
- Backend endpoint already exists

---

### Feature 5 - AI Closing Suggestions

- **Branch:** `enhancement-l1-ai-closing-suggestions`
- **Feature Area:** AI Features
- **Affected Roles:** Agents
- **Technology Stack:** FastAPI, LangChain, OpenAI API, Next.js
- **Issue:** Agents need help writing professional closing comments
- **Description:** Frontend implementation for AI-generated closing comment suggestions utilizing existing backend endpoint `/tickets/{id}/closing-suggestions`
- **Impact:** Faster ticket resolution, consistent closing documentation
- **Learning Goals:** AI integration, form enhancement, suggestion selection UX

**Files to Modify:**
- `frontend/app/tickets/[id]/page.tsx` - Add suggestions button to close form, suggestions display, suggestion selection
- `frontend/src/app/shared/components/AISuggestionsCard.tsx` - Create suggestions component
- `frontend/src/lib/api/tickets.ts` - Add `getClosingSuggestions()` API method

**Frontend Tasks:**
- Add "Get Suggestions" button to closing form
- Create suggestions display with multiple options
- Implement suggestion selection and insertion
- Add loading states and error handling
- Show suggestion metadata
- Integrate with existing backend `/tickets/{id}/closing-suggestions` endpoint

**Prerequisites:**
- Google API Key must be configured in backend `.env`
- Backend endpoint already exists

---

## Level 2 Features (Intermediate Features)

### Feature 1 - File Attachments ✅ IMPLEMENTED

- **Branch:** `enhancement-l2-file-attachments`
- **Status:** ✅ **ALREADY IMPLEMENTED IN BASE-VERSION**
- **Feature Area:** File Management
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, MongoDB, GridFS, Next.js
- **Description:** Users can attach files to tickets and comments with file validation
- **Impact:** Better issue documentation, faster resolution
- **Learning Goals:** File upload handling, GridFS storage, file validation

**Note:** This feature has been fully implemented and is available in the `base-version` branch.

---

### Feature 2 - SLA with Automation

- **Branch:** `enhancement-l2-sla-automation`
- **Feature Area:** SLA Management
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, MongoDB, Celery, Next.js
- **Issue:** Manual SLA tracking is error-prone and time-consuming
- **Description:** Automated SLA tracking with business day calculations, automatic status updates, and visual indicators
- **Impact:** Improved compliance, reduced manual work
- **Learning Goals:** Background tasks, business logic, time calculations

**Files to Modify:**

**Backend:**
- `backend/src/models/ticket.py` - Add SLA fields: `sla_due_date`, `sla_status`, `sla_breach_count`
- `backend/src/services/sla_service.py` - Create SLA calculation service
- `backend/src/tasks/sla_monitor.py` - Create Celery task for SLA monitoring
- `backend/src/api/v1/routes/ticket.py` - Add SLA endpoints

**Frontend:**
- `frontend/app/tickets/[id]/page.tsx` - Add SLA indicator display
- `frontend/src/app/shared/components/SLAIndicator.tsx` - Create SLA visual component
- `frontend/src/lib/utils/date.ts` - Add business day calculation functions

**Backend Tasks:**
- Implement business day calculations
- Create SLA monitoring background task
- Add automatic status updates
- Implement breach tracking
- Create SLA reporting endpoints

**Frontend Tasks:**
- Display SLA countdown timer
- Show SLA status indicators
- Add breach warnings
- Create SLA dashboard

---

### Feature 3 - AI adds tags to knowledge base articles

- **Branch:** `enhancement-l2-ai-kb-tags`
- **Feature Area:** AI Features, Knowledge Base
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, LangChain, OpenAI API, MongoDB, Next.js
- **Issue:** Manual tagging is time-consuming and inconsistent
- **Description:** AI automatically generates relevant tags based on article content analysis
- **Impact:** Better article organization, improved search results
- **Learning Goals:** AI content analysis, tag generation, NLP

**Files to Modify:**

**Backend:**
- `backend/src/langchain_app/chains/generate_tags.py` - Create tag generation chain
- `backend/src/api/v1/routes/article.py` - Add tag generation endpoint
- `backend/src/services/ai_service.py` - Add tag generation method

**Frontend:**
- `frontend/app/knowledge-base/create/page.tsx` - Add "Generate Tags" button
- `frontend/src/lib/api/articles.ts` - Add `generateTags()` method

**Backend Tasks:**
- Create AI prompt for tag generation
- Implement content analysis
- Generate 3-5 relevant tags
- Add tag validation

**Frontend Tasks:**
- Add "Generate Tags" button
- Display generated tags
- Allow tag editing/approval
- Show loading states

**Prerequisites:**
- Google API Key required

---

### Feature 4 - Edit knowledge base articles

- **Branch:** `enhancement-l2-kb-edit`
- **Feature Area:** Knowledge Base
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** No way to update existing KB articles
- **Description:** Allow editing of existing articles with version history
- **Impact:** Keep knowledge base up-to-date and accurate
- **Learning Goals:** CRUD operations, version control, rich text editing

**Files to Modify:**

**Backend:**
- `backend/src/api/v1/routes/article.py` - Add update endpoint
- `backend/src/services/article_service.py` - Add update methods
- `backend/src/models/article.py` - Add version tracking

**Frontend:**
- `frontend/app/knowledge-base/[id]/edit/page.tsx` - Create edit page
- `frontend/src/lib/api/articles.ts` - Add `updateArticle()` method

**Backend Tasks:**
- Create article update endpoint
- Implement version history
- Add content validation
- Track edit metadata

**Frontend Tasks:**
- Create edit page with form
- Pre-populate with existing data
- Show version history
- Add save/cancel buttons

---

### Feature 5 - Automatic agent assignment using AI

- **Branch:** `enhancement-l2-ai-agent-assignment`
- **Feature Area:** AI Features, Ticket Management
- **Affected Roles:** Agents, System
- **Technology Stack:** FastAPI, LangChain, OpenAI API, MongoDB, Next.js
- **Issue:** Manual assignment is slow and doesn't optimize for agent skills
- **Description:** AI automatically assigns tickets to best-fit agents based on skills, workload, and ticket content
- **Impact:** Better ticket distribution, faster resolution times
- **Learning Goals:** AI decision-making, workload balancing, skill matching

**Files to Modify:**

**Backend:**
- `backend/src/langchain_app/chains/agent_assignment.py` - Create assignment chain
- `backend/src/services/assignment_service.py` - Create assignment logic
- `backend/src/api/v1/routes/ticket.py` - Add auto-assign endpoint
- `backend/src/models/user.py` - Add agent specialization fields

**Frontend:**
- `frontend/app/tickets/[id]/page.tsx` - Add "Auto-Assign" button
- `frontend/src/lib/api/tickets.ts` - Add `autoAssign()` method

**Backend Tasks:**
- Analyze ticket content for skills needed
- Check agent availability and workload
- Match skills to ticket requirements
- Assign to best-fit agent
- Track assignment reasoning

**Frontend Tasks:**
- Add "Auto-Assign" button
- Show assignment reasoning
- Display agent match score
- Allow manual override

**Prerequisites:**
- Google API Key required

---

## Level 3 Features (Advanced Features)

### Feature 1 - Chat with Knowledge Base

- **Branch:** `enhancement-l3-kb-chat`
- **Feature Area:** AI Features, Knowledge Base
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, LangChain, RAG, Vector DB, OpenAI API, Next.js
- **Issue:** Users struggle to find relevant KB articles
- **Description:** RAG-based chatbot that answers questions using KB articles
- **Impact:** Faster self-service, reduced ticket volume
- **Learning Goals:** RAG implementation, vector databases, conversational AI

**Advanced Implementation:** Vector embeddings, semantic search, context retrieval

**Prerequisites:**
- Google API Key required
- Vector database setup required

---

### Feature 2 - Users can live chat with agents

- **Branch:** `enhancement-l3-live-agent-chat`
- **Feature Area:** Real-time Communication
- **Affected Roles:** Users, Agents
- **Technology Stack:** WebSockets, FastAPI, MongoDB, Next.js
- **Issue:** Ticket comments are too slow for urgent issues
- **Description:** Real-time chat between users and agents with presence indicators and typing status
- **Impact:** Faster issue resolution, better user experience
- **Learning Goals:** WebSocket implementation, real-time state management

**Advanced Implementation:** Connection handling, presence tracking, message queuing

---

### Feature 3 - Escalations and Automatic Reassignments

- **Branch:** `enhancement-l3-escalations`
- **Feature Area:** Ticket Management
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, MongoDB, Celery, Next.js
- **Issue:** High-priority tickets don't get escalated appropriately
- **Description:** Automatic escalation based on SLA breaches, priority, and agent availability
- **Impact:** Critical issues get proper attention
- **Learning Goals:** Complex business rules, automated workflows

**Advanced Implementation:** Escalation rules engine, reassignment logic, notification system

---

### Feature 4 - NLP Sentiment Analysis

- **Branch:** `enhancement-l3-sentiment-analysis`
- **Feature Area:** AI Features
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, LangChain, OpenAI API, MongoDB, Next.js
- **Issue:** Agents can't easily identify frustrated customers
- **Description:** Real-time sentiment analysis of ticket content and comments
- **Impact:** Better customer service, proactive issue handling
- **Learning Goals:** NLP, sentiment classification, real-time analysis

**Advanced Implementation:** Multi-message sentiment tracking, emotion detection, escalation triggers

**Prerequisites:**
- Google API Key required

---

### Feature 5 - Multi-language Support

- **Branch:** `enhancement-l3-multi-language`
- **Feature Area:** Internationalization
- **Affected Roles:** All Users
- **Technology Stack:** FastAPI, i18n, Auto-translation API, Next.js
- **Issue:** System only supports English
- **Description:** Multi-language interface with automatic translation
- **Impact:** Global accessibility
- **Learning Goals:** Internationalization, translation APIs, locale management

**Advanced Implementation:** Dynamic language switching, RTL support, translation caching

---

# BUGS

## Level 1 Bugs

### Bug 1 - Navigation broken links

- **Branch:** `bug-l1-navigation-broken-links`
- **Feature Area:** Navigation
- **Affected Roles:** All Users
- **Technology Stack:** Next.js
- **Issue:** Several sidebar navigation links return 404 errors
- **Description:** Main navigation links point to incorrect routes
- **Impact:** Users cannot access features, poor user experience
- **Root Cause:** Incorrect path definitions in navigation configuration
- **How to Introduce:** Modify navigation paths to point to non-existent routes

**Files to Modify to Create Bug:**
- `frontend/src/constants/routes.ts` - Change path definitions to incorrect values
- `frontend/src/app/shared/components/Sidebar.tsx` - Update links to use broken paths

**Files to Fix:**
- `frontend/src/constants/routes.ts` - Correct path definitions
- `frontend/src/app/shared/components/Sidebar.tsx` - Update links to use correct paths
- Verify all navigation links work properly

---

### Bug 2 - Category update page doesn't save changes

- **Branch:** `bug-l1-category-update-failure`
- **Feature Area:** Category Management
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** Category edit form appears to save but changes aren't persisted to database
- **Description:** Users edit category names/descriptions but changes revert after page refresh
- **Impact:** Administrators cannot properly manage category structure, wasted time
- **Root Cause:** Update API call not being made despite form submission appearing successful
- **How to Introduce:** Comment out the actual API call while leaving form submission handling

**Files to Modify to Create Bug:**
- `frontend/src/app/features/categories/CategoriesList.tsx` - Comment out the `categoriesApi.update()` call in `handleSubmit` function

**Files to Fix:**
- `frontend/src/app/features/categories/CategoriesList.tsx` - Uncomment the `categoriesApi.update()` call in `handleSubmit` function (lines 149-152)
- Frontend Fix: Ensure category update API is actually called and properly handles responses

---

### Bug 3 - Comment timestamps display in UTC instead of user timezone

- **Branch:** `bug-l1-comment-timezone`
- **Feature Area:** Comments, Date Display
- **Affected Roles:** All Users
- **Technology Stack:** Next.js, date-fns
- **Issue:** All comment timestamps show in UTC instead of user's local timezone
- **Description:** Users see confusing timestamps that don't match their local time
- **Impact:** Poor user experience, confusion about comment timing
- **Root Cause:** Date formatting doesn't convert UTC to local timezone
- **How to Introduce:** Use UTC formatting instead of local timezone conversion

**Files to Modify to Create Bug:**
- `frontend/src/lib/utils/date.ts` - Modify date formatting to use UTC

**Files to Fix:**
- `frontend/src/lib/utils/date.ts` - Update `formatFullDateTime()` to properly convert UTC to local timezone
- `frontend/app/tickets/[id]/page.tsx` - Ensure all timestamp displays use proper formatting

---

### Bug 4 - Duplicate tickets created on single submission

- **Branch:** `bug-l1-duplicate-ticket-creation`
- **Feature Area:** Ticket Creation
- **Affected Roles:** Users
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** Single form submission creates two identical tickets
- **Description:** Users submit ticket form once but two tickets appear in system
- **Impact:** Database bloat, confused users, wasted agent time
- **Root Cause:** Duplicate API calls in form submission handler
- **How to Introduce:** Call the create API twice in the submit handler

**Files to Modify to Create Bug:**
- `frontend/src/app/features/tickets/CreateTicketForm.tsx` - Add duplicate `ticketsApi.create()` call

**Files to Fix:**
- `frontend/src/app/features/tickets/CreateTicketForm.tsx` - Remove duplicate API call, ensure single submission

---

### Bug 5 - Knowledge Base search returns no results

- **Branch:** `bug-l1-kb-search-failure`
- **Feature Area:** Knowledge Base, Search
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** KB search returns empty results even for valid queries
- **Description:** Users search for known article content but get no results
- **Impact:** Users cannot find help articles, increased support burden
- **Root Cause:** Search query not properly passed to backend API
- **How to Introduce:** Break the search parameter passing or query construction

**Files to Modify to Create Bug:**
- `frontend/app/knowledge-base/page.tsx` - Break search parameter passing
- `frontend/src/lib/api/articles.ts` - Modify search query construction

**Files to Fix:**
- `frontend/app/knowledge-base/page.tsx` - Fix search parameter passing
- `frontend/src/lib/api/articles.ts` - Correct search query construction
- Ensure search integrates properly with backend API

---

## Level 2 Bugs

### Bug 1 - Knowledge base article editor loads with empty content

- **Branch:** `bug-l2-kb-edit-content-missing`
- **Feature Area:** Knowledge Base, Rich Text Editor
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** Next.js, Rich Text Editor
- **Issue:** Edit page loads with empty editor despite article having content
- **Description:** Users click edit but see blank editor
- **Impact:** Cannot edit existing articles
- **Root Cause:** Content not properly converted to editor format
- **How to Introduce:** Skip content conversion/loading in edit page

**Files to Fix:**
- `frontend/app/knowledge-base/[id]/edit/page.tsx` - Fix content loading and conversion
- Ensure rich text content properly initializes editor

---

### Bug 2 - SLA calculations use continuous monitoring without business day consideration

- **Branch:** `bug-l2-sla-weekend-calculation`
- **Feature Area:** SLA Management
- **Affected Roles:** Agents, System
- **Technology Stack:** FastAPI, Python
- **Issue:** SLA calculations include weekends/holidays
- **Description:** Tickets breach SLA unfairly due to weekend counting
- **Impact:** Inaccurate SLA tracking
- **Root Cause:** Calendar day calculation instead of business days
- **How to Introduce:** Use total hours instead of business hours

**Files to Fix:**
- `backend/src/services/sla_service.py` - Implement proper business day calculations
- Exclude weekends and holidays from SLA calculations

---

### Bug 3 - Agent assignment uses normalized workload that ignores actual ticket distribution

- **Branch:** `bug-l2-assignment-workload-ignored`
- **Feature Area:** Agent Assignment
- **Affected Roles:** Agents
- **Technology Stack:** FastAPI, Python
- **Issue:** Assignment doesn't balance workload properly
- **Description:** Some agents get overloaded while others have few tickets
- **Impact:** Uneven workload distribution
- **Root Cause:** Workload calculation doesn't consider ticket complexity
- **How to Introduce:** Use simple count instead of weighted workload

**Files to Fix:**
- `backend/src/services/assignment_service.py` - Implement proper workload calculation
- Consider ticket priority, status, and age in workload calculations

---

### Bug 4 - AI tag generation uses title-focused analysis for performance optimization

- **Branch:** `bug-l2-ai-tags-title-only`
- **Feature Area:** AI Features, Knowledge Base
- **Affected Roles:** Agents
- **Technology Stack:** FastAPI, LangChain, OpenAI API
- **Issue:** Generated tags only reflect article title
- **Description:** Tags miss important content themes
- **Impact:** Poor article organization
- **Root Cause:** Only article title sent to AI
- **How to Introduce:** Only pass title to tag generation

**Files to Fix:**
- `backend/src/langchain_app/chains/generate_tags.py` - Include full article content in analysis
- Analyze both title and content for comprehensive tag generation

**Prerequisites:**
- Google API Key required

---

### Bug 5 - File size display uses precise byte-level formatting

- **Branch:** `bug-l2-file-size-display`
- **Feature Area:** File Attachments
- **Affected Roles:** All Users
- **Technology Stack:** Next.js
- **Issue:** File sizes show as large numbers of bytes
- **Description:** "1048576 bytes" instead of "1 MB"
- **Impact:** Poor user experience
- **Root Cause:** Missing size formatting utility
- **How to Introduce:** Display raw byte count

**Files to Fix:**
- `frontend/src/lib/utils/formatting.ts` - Add `formatFileSize()` function
- Convert bytes to KB/MB/GB display
- Update all file size displays to use formatter

---

## Level 3 Bugs

### Bug 1 - WebSocket connection memory leaks cause server crashes

- **Branch:** `bug-l3-websocket-memory-leak`
- **Feature Area:** WebSockets, Server Performance
- **Affected Roles:** All Users (System stability)
- **Technology Stack:** FastAPI, WebSockets, Python
- **Issue:** Server doesn't clean up dead WebSocket connections
- **Description:** Server accumulates dead connections causing memory exhaustion
- **Impact:** Server crashes under load
- **Root Cause:** Missing connection cleanup logic
- **How to Introduce:** Remove cleanup and event listener removal

**Files to Fix:**
- `backend/app/websockets/connection.py` - Add proper connection cleanup
- `backend/app/websockets/ticket_events.py` - Implement disconnection handling
- `frontend/src/hooks/useWebSocket.ts` - Add cleanup in useEffect

---

### Bug 2 - Docker container resource limits cause FastAPI worker crashes

- **Branch:** `bug-l3-docker-worker-resource-limits`
- **Feature Area:** Docker Deployment, API Performance
- **Affected Roles:** All Users
- **Technology Stack:** Docker, FastAPI, Gunicorn
- **Issue:** Workers crash due to insufficient resources
- **Description:** API returns 502 errors under moderate load
- **Impact:** API unreliability
- **Root Cause:** Docker limits set too low
- **How to Introduce:** Set very low memory/CPU limits

**Files to Fix:**
- `docker-compose.yml` - Increase memory and CPU limits
- `backend/Dockerfile` - Optimize worker configuration

---

### Bug 3 - Concurrent ticket updates cause data race conditions

- **Branch:** `bug-l3-concurrent-update-race-condition`
- **Feature Area:** Concurrency, Data Integrity
- **Affected Roles:** Agents
- **Technology Stack:** MongoDB, FastAPI, Next.js
- **Issue:** Multiple agents updating same ticket causes data corruption
- **Description:** Comments disappear, status changes overwritten
- **Impact:** Data loss, conflicting states
- **Root Cause:** Missing optimistic locking
- **How to Introduce:** Remove version checking and atomic updates

**Files to Fix:**
- `backend/src/api/v1/routes/tickets.py` - Add optimistic locking
- `backend/src/models/ticket.py` - Add version field and atomic updates
- `frontend/app/tickets/[id]/page.tsx` - Add conflict resolution UI

---

### Bug 4 - Knowledge Base search index corruption causes inconsistent results

- **Branch:** `bug-l3-kb-search-index-corruption`
- **Feature Area:** Search Performance, Data Integrity
- **Affected Roles:** Users, Agents
- **Technology Stack:** MongoDB, Text Search, FastAPI
- **Issue:** Search returns different results for identical queries
- **Description:** Index corrupts during article updates
- **Impact:** Unreliable search
- **Root Cause:** Index not maintained during CRUD
- **How to Introduce:** Remove index rebuilding after updates

**Files to Fix:**
- `backend/src/api/v1/routes/articles.py` - Add index maintenance
- `backend/src/services/search.py` - Create consistency checking
- `frontend/app/knowledge-base/page.tsx` - Add validation and fallbacks

---

### Bug 5 - JWT token validation bypassed in WebSocket connections

- **Branch:** `bug-l3-websocket-jwt-bypass`
- **Feature Area:** Authentication, Security
- **Affected Roles:** All Users (Security vulnerability)
- **Technology Stack:** WebSockets, JWT, FastAPI
- **Issue:** WebSocket connections don't validate JWT tokens
- **Description:** Unauthorized access to real-time ticket updates
- **Impact:** Security vulnerability, data breaches
- **Root Cause:** Missing WebSocket authentication middleware
- **How to Introduce:** Comment out JWT validation in WebSocket handler

**Files to Fix:**
- `backend/app/websockets/connection.py` - Implement JWT validation
- `backend/src/core/security.py` - Add WebSocket token validation
- `frontend/src/hooks/useWebSocket.ts` - Add authentication token handling
- `frontend/src/contexts/RealtimeContext.tsx` - Add auth state management

---

## Summary

**Total Tasks:** 30 (15 bugs + 15 enhancements)

### By Level:
- **Level 1:** 10 tasks (5 bugs + 5 enhancements) - Foundation
- **Level 2:** 10 tasks (5 bugs + 5 enhancements) - Intermediate
- **Level 3:** 10 tasks (5 bugs + 5 enhancements) - Advanced

### Technology Focus:
- **Frontend:** Next.js, React, TypeScript
- **Backend:** FastAPI, Python
- **Database:** MongoDB, GridFS
- **AI:** LangChain, OpenAI API, RAG
- **Real-time:** WebSockets
- **Infrastructure:** Docker, Celery

### Learning Outcomes:
- Full-stack development
- AI integration
- Real-time features
- Security best practices
- Performance optimization
- DevOps and deployment

---

**Note:** This document is for reference. See `TASK-TRACKING.md` for current task assignments and status.

