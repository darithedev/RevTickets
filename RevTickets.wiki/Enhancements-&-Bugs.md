# Ticketing System Enhancements and Bugs

This document outlines all planned enhancements and bugs that will be implemented in separate branches as modular additions to the base ticketing system.

## Enhancement Structure
- **15 total enhancements** across 3 levels of complexity
- **5 enhancements per level** 
- Each enhancement in its own git branch
- Branches follow naming convention: `enhancement-l[1-3]-[feature-name]`

## Bug Structure  
- **15 total bugs** across 3 levels of complexity
- **5 bugs per level**
- Each bug in its own git branch
- Branches follow naming convention: `bug-l[1-3]-[bug-name]`

## Recent Updates
**Updated bug implementations:**
- `bug-l1-kb-duplicate-records` → `bug-l1-navigation-broken-links` (more suitable for Level 1)
- All bugs now include "Files to Fix" sections showing exactly which files students need to modify

**Enhanced documentation:**
- Added "Files to Modify" sections to all enhancements showing implementation locations
- Specified exact file paths and line numbers where applicable
- Included fix instructions for bug branches

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
- **Files to Modify:**
  - `frontend/app/tickets/[id]/page.tsx` - Add edit functionality, edit buttons, inline editing interface, edit state management
  - `frontend/src/app/shared/types/ticket.ts` - Add Comment interface fields: `edited`, `edit_count`, `edit_history`; Add `CommentEditHistory` and `UpdateComment` interfaces
  - `frontend/src/lib/utils/date.ts` - Add `canEditComment()` and `getEditTimeRemaining()` functions for 24-hour validation
  - `frontend/src/lib/api/tickets.ts` - Add `updateComment()` API method
- **Frontend Tasks:**
  - Add edit button to comment components
  - Create edit form modal/inline editing
  - Add edit history display
  - Implement 24-hour time limit validation
  - Show edited indicator on comments

### Feature 2 - Ticket Reopening
- **Branch:** `enhancement-l1-ticket-reopening`
- **Feature Area:** Ticket Lifecycle Management
- **Affected Roles:** Users
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** Users need ability to reopen resolved tickets for follow-up issues
- **Description:** Enable ticket reopening within 10 working days with business date calculations
- **Impact:** Better handling of recurring issues, improved customer satisfaction
- **Learning Goals:** Business date calculations, state management, complex business logic
- **Files to Modify:**
  - `frontend/app/tickets/[id]/page.tsx` - Add reopen ticket section, reopen confirmation modal, reopen state management and handlers
  - `frontend/src/lib/utils/date.ts` - Add `canReopenTicket()`, `getReopenTimeRemaining()`, and `formatBusinessDaysFromNow()` functions for 10 business day calculations
  - `frontend/src/lib/api/tickets.ts` - Add `reopenTicket()` API method
- **Frontend Tasks:**
  - Add "Reopen Ticket" button to closed tickets
  - Implement business day calculation display
  - Create reopening confirmation modal
  - Update ticket status displays
  - Add reopening history to ticket timeline

### Feature 3 - Knowledge Base Title Search
- **Branch:** `enhancement-l1-kb-title-search`
- **Feature Area:** Knowledge Base
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** Users need efficient way to find KB articles by searching titles
- **Description:** Implement frontend search interface utilizing existing backend search API with real-time search, filtering, and pagination
- **Impact:** Faster problem resolution, reduced duplicate tickets
- **Learning Goals:** Frontend search implementation, API integration, real-time search UX
- **Files to Modify:**
  - `frontend/app/knowledge-base/page.tsx` - Add search interface with TextInput, search state management, debounced search, search results display, clear search functionality
  - `frontend/src/app/shared/components/SearchBar.tsx` - Create reusable search component
  - `frontend/src/hooks/useDebounceSearch.ts` - Create debounced search hook
- **Frontend Tasks:**
  - Build search interface with real-time suggestions
  - Create search results page with filtering
  - Add search highlighting in results
  - Implement pagination for search results
  - Add search history/recent searches
  - Integrate with existing `articlesApi.search()` method

### Feature 4 - AI Ticket Summary
- **Branch:** `enhancement-l1-ai-ticket-summary`
- **Feature Area:** AI Features
- **Affected Roles:** Agents
- **Technology Stack:** FastAPI, LangChain, OpenAI API, Next.js
- **Issue:** Agents need quick overview of long ticket conversations
- **Description:** Frontend implementation for AI-powered ticket summaries utilizing existing backend endpoint `/tickets/{id}/summary`
- **Impact:** Faster ticket processing, improved agent productivity
- **Learning Goals:** AI API integration, async UI handling, loading states, error handling
- **Files to Modify:**
  - `frontend/app/tickets/[id]/page.tsx` - Add AI summary section with Brain/Sparkles icons, summary generation button, loading states, summary display component with timestamp
  - `frontend/src/app/shared/types/ticket.ts` - Add Ticket interface fields: `aiSummary`, `summaryGeneratedAt`; Add `TicketSummaryResponse` interface
  - `frontend/src/lib/api/tickets.ts` - Add `generateSummary()` API method that calls existing backend endpoint
  - `frontend/src/app/shared/components/AISummaryCard.tsx` - Create AI summary display component
- **Frontend Tasks:**
  - Add "Generate Summary" button to ticket details
  - Create summary display component with loading states
  - Add loading states for AI processing
  - Implement summary refresh functionality
  - Show summary timestamps and metadata
  - Handle API errors gracefully

### Feature 5 - AI Closing Suggestions
- **Branch:** `enhancement-l1-ai-closing-suggestions`
- **Feature Area:** AI Features
- **Affected Roles:** Agents
- **Technology Stack:** FastAPI, LangChain, OpenAI API, Next.js
- **Issue:** Agents need assistance with appropriate closing comments
- **Description:** Frontend implementation for AI-powered closing comment suggestions utilizing existing backend endpoint `/tickets/{id}/closing_comments`
- **Impact:** Consistent closing documentation, improved resolution quality
- **Learning Goals:** AI API integration, form enhancement, suggestion UI patterns
- **Files to Modify:**
  - `frontend/app/tickets/[id]/page.tsx` - Add AI closing suggestions section in close ticket form, suggestion generation button, loading states, suggestion display with reason and comment, apply suggestion functionality
  - `frontend/src/app/shared/types/ticket.ts` - Add `ClosingCommentsResponse` interface with `reason` and `comment` fields
  - `frontend/src/lib/api/tickets.ts` - Add `generateClosingComments()` API method that calls existing backend endpoint
  - `frontend/src/app/shared/components/AIClosingSuggestions.tsx` - Create closing suggestions component
- **Frontend Tasks:**
  - Add AI suggestions panel to ticket closing modal
  - Create suggestion selection interface
  - Add loading states and error handling
  - Implement suggestion acceptance/editing
  - Show suggestion reasoning and confidence

## Level 2 Features (Intermediate Features)

### Feature 1 - File Attachments ✅ **IMPLEMENTED**
- **Branch:** `enhancement-l2-file-attachments`
- **Feature Area:** File Management
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, MongoDB GridFS, Next.js
- **Issue:** Users need ability to attach files to tickets and comments
- **Description:** Enable file uploads with security validation, preview, and GridFS storage
- **Impact:** Better issue documentation, reduced back-and-forth communication
- **Learning Goals:** File handling in FastAPI, GridFS, security validation
- **Implementation Status:** Full frontend and backend implementation
- **Files Modified:**

**Frontend Files:**
  - ✅ `frontend/app/tickets/create/page.tsx` - Added file upload component integration and upload workflow
  - ✅ `frontend/app/tickets/[id]/page.tsx` - Added file attachment display, download, and preview functionality 
  - ✅ `frontend/src/app/shared/components/FileUpload.tsx` - Complete drag-and-drop upload component with validation
  - ✅ `frontend/src/lib/api/files.ts` - Full file API with upload, download, validation, and ticket attachment methods
  - ✅ `frontend/src/lib/utils/fileValidation.ts` - Comprehensive security validation utility
  - ✅ `frontend/src/app/shared/components/index.ts` - Updated exports for FileUpload component
  - ✅ `frontend/src/lib/api/index.ts` - Updated exports for filesApi

**Backend Files:**
  - ✅ `backend/src/models/file.py` - FileDocument and TicketFileAttachment models for GridFS metadata
  - ✅ `backend/src/schemas/file.py` - Complete API schemas for file operations and responses
  - ✅ `backend/src/services/file_service.py` - Full file service with GridFS, validation, and security
  - ✅ `backend/src/api/v1/routes/file.py` - Complete file upload/download/management API endpoints
  - ✅ `backend/src/api/v1/routes/ticket.py` - Added ticket file attachment endpoints
  - ✅ `backend/src/db/init_db.py` - Updated with GridFS database configuration
  - ✅ `backend/main.py` - Added file router registration
  - ✅ `backend/src/models/__init__.py` - Updated exports for file models
  - ✅ `backend/src/schemas/__init__.py` - Updated exports for file schemas

**Frontend Features Implemented:**
  - ✅ Drag-and-drop file upload component with progress tracking
  - ✅ File type validation (images, PDFs, documents, text files)
  - ✅ Size limits (10MB per file, 5 files max per ticket)
  - ✅ File preview for images with download functionality
  - ✅ Upload progress indicators and error handling
  - ✅ File attachment display in ticket detail view
  - ✅ Secure filename sanitization and validation

**Backend Features Implemented:**
  - ✅ GridFS integration for large file storage
  - ✅ Comprehensive file validation and security checks
  - ✅ RESTful API endpoints for file operations
  - ✅ File upload with progress tracking support
  - ✅ Access control and permission checking
  - ✅ Ticket-file relationship management
  - ✅ File metadata storage and retrieval
  - ✅ Secure file download with proper headers

**API Endpoints Available:**
  - `POST /api/v1/files/upload` - Single file upload
  - `POST /api/v1/files/upload/bulk` - Multiple file upload
  - `GET /api/v1/files/{file_id}/download` - File download
  - `GET /api/v1/files/{file_id}/preview` - File preview (images/PDFs)
  - `DELETE /api/v1/files/{file_id}` - Delete file
  - `GET /api/v1/tickets/{ticket_id}/files` - Get ticket attachments
  - `POST /api/v1/tickets/{ticket_id}/files` - Attach files to ticket
  - `DELETE /api/v1/tickets/{ticket_id}/files/{file_id}` - Detach file from ticket

**Security Measures:**
  - File type whitelist validation
  - Dangerous file type blocking (executables, scripts)
  - Filename sanitization and path traversal prevention
  - Size limits and count restrictions
  - MIME type vs extension validation
  - Access control based on user permissions

### Feature 2 - SLA with Automation
- **Branch:** `enhancement-l2-sla-automation`
- **Feature Area:** SLA Management
- **Affected Roles:** Agents
- **Technology Stack:** FastAPI, MongoDB, Celery, Next.js
- **Issue:** Need automatic SLA tracking with escalation workflows
- **Description:** Implement SLA tracking with background job that checks for tickets that have gone overtime (no response from agent), updates the database record, and displays overtime status on frontend
- **Impact:** Automated compliance tracking, visual indicators for overdue tickets
- **Learning Goals:** Background task processing, Celery integration, database updates
- **Files Modified:**
  - `backend/src/models/ticket.py` - Added SLA fields: `sla_due_date`, `sla_breached`
  - `backend/src/schemas/ticket.py` - Added SLA response schema fields with aliases
  - `backend/src/services/sla_service.py` - Created SLA calculation and monitoring service
  - `backend/src/services/ticket_service.py` - Integrated SLA setup on ticket creation
  - `backend/src/tasks/sla_monitor.py` - Created Celery tasks for SLA monitoring
  - `backend/src/db/init_db.py` - Added database indices for SLA queries
  - `backend/requirements.txt` - Added Celery and Redis dependencies
  - `docker-compose.yml` - Added Redis, Celery worker, and Celery beat services
  - `frontend/src/app/shared/components/SLAIndicator.tsx` - Created real-time SLA indicator component
  - `frontend/src/app/shared/components/index.ts` - Exported SLA indicator component
  - `frontend/src/app/shared/types/ticket.ts` - Added SLA fields to ticket type
  - `frontend/app/tickets/[id]/page.tsx` - Added agent-only SLA status display
- **Backend Implementation:**
  - SLA calculation based on ticket priority (2h-48h response times)
  - Celery background task monitors SLA breaches every 3 minutes
  - SLA timer pauses when status is "waiting_for_customer"
  - UTC-based datetime handling for consistent timezone management
  - Database indices for efficient SLA queries
  - Automatic SLA setup when tickets are created
- **Frontend Implementation:**
  - Real-time countdown timer with second-by-second updates
  - Color-coded status indicators (green/yellow/red)
  - SLA pause indicator when waiting for customer response
  - Agent-only visibility for SLA information
  - Proper UTC to local timezone conversion
  - Dynamic status text based on time remaining

### Feature 3 - AI adds tags to knowledge base articles
- **Branch:** `enhancement-l2-ai-kb-tags`
- **Feature Area:** AI Features, Knowledge Base
- **Affected Roles:** Agents
- **Technology Stack:** FastAPI, LangChain, OpenAI API, MongoDB, Next.js
- **Issue:** Knowledge base articles need automated tagging for better organization
- **Description:** AI analyzes article content and automatically generates relevant tags based on the content
- **Impact:** Better knowledge base organization, improved searchability
- **Learning Goals:** Content analysis AI, tag generation
- **Files to Modify:**
  - `backend/src/models/article.py` - Add `ai_generated_tags` field
  - `backend/src/services/ai_service.py` - Add tag generation method
  - `backend/src/langchain_app/chains/generate_tags.py` - Create tag generation chain
  - `backend/src/api/v1/routes/article.py` - Add tag generation endpoint
  - `frontend/app/knowledge-base/create/page.tsx` - Add AI tag generation button
  - `frontend/app/knowledge-base/[id]/page.tsx` - Display AI-generated tags
- **Backend Tasks:**
  - Build content analysis service using LangChain
  - Create tag generation from article content
  - Add API endpoint for generating tags
- **Frontend Tasks:**
  - Add button to generate AI tags
  - Display generated tags with approval interface 

### Feature 4 - Edit knowledge base articles
- **Branch:** `enhancement-l2-kb-edit`
- **Feature Area:** Knowledge Base Management
- **Affected Roles:** Agents
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** Agents need ability to edit existing knowledge base articles after creation
- **Description:** Add edit functionality for knowledge base articles, allowing agents to update title, content, categories, and tags without restrictions (unlike comment editing which has time limits)
- **Impact:** Improved content maintenance, ability to keep knowledge base current and accurate
- **Learning Goals:** CRUD operations, form pre-population, update API integration, content versioning
- **Files to Modify:**
  - `frontend/app/knowledge-base/[id]/page.tsx` - Add edit mode toggle, edit button, inline editing interface
  - `frontend/app/knowledge-base/[id]/edit/page.tsx` - Create dedicated edit page with form pre-populated from existing article
  - `frontend/src/lib/api/articles.ts` - Ensure update API method is properly implemented
  - `frontend/src/app/shared/types/article.ts` - Ensure UpdateArticle interface supports all editable fields
- **Frontend Tasks:**
  - Add "Edit Article" button to article detail view (agent-only)
  - Create edit form with pre-populated data from existing article
  - Implement save/cancel functionality
  - Add form validation matching create article requirements
  - Handle update success/error states
  - Maintain edit history or version tracking (optional)
- **Backend Tasks:**
  - Verify existing update endpoint handles all required fields
  - Ensure proper validation and error handling for updates


### Feature 5 - Automatic agent assignment using AI
- **Branch:** `enhancement-l2-ai-agent-assignment`
- **Feature Area:** Agent Assignment
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, LangChain, MongoDB, Next.js
- **Issue:** The current programmed ticket assignment doesn't do a good job
- **Description:** After a ticket is created, AI examines the ticket info and available agents to automatically select the best agent for assignment. It should take into account agent workload (how many tickets they already have), and category specialization (ticket and agent should have similar category assigned).
- **Impact:** Improved ticket-agent matching, automated assignment process
- **Learning Goals:** AI decision making, agent-ticket matching algorithms
- **Files to Modify:**
  - `backend/src/services/assignment_service.py` - Create AI assignment service
  - `backend/src/langchain_app/chains/agent_assignment.py` - Create assignment analysis chain
  - `backend/src/api/v1/routes/ticket.py` - Update ticket creation to use AI assignment
  - `frontend/app/tickets/[id]/page.tsx` - Display assignment details
- **Backend Tasks:**
  - Build AI-powered agent selection using LangChain
  - Create agent-ticket matching algorithm
  - Replace manual assignment with automated assignment
- **Frontend Tasks:**
  - Display auto-assignment information
  - Add manual override controls

## Level 3 Features (Advanced Features)

### Feature 1 - Chat with Knowledge Base
- **Branch:** `enhancement-l3-kb-chat`
- **Feature Area:** AI-Powered Search
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, LangChain, Vector Database, OpenAI API, Next.js
- **Issue:** Users need conversational interface to find relevant KB content
- **Description:** RAG implementation allowing natural language queries against knowledge base
- **Impact:** Dramatically improved self-service capabilities, reduced agent workload
- **Learning Goals:** Vector embeddings, RAG architecture, conversational AI
- **Files to Modify:**
  - `frontend/app/knowledge-base/chat/page.tsx` - Create main chat interface
  - `frontend/src/app/shared/components/ChatInterface.tsx` - Build reusable chat component
  - `frontend/src/lib/api/kb-chat.ts` - Add KB chat API methods
  - `frontend/src/hooks/useChatHistory.ts` - Create chat history management hook
- **Frontend Tasks:**
  - Build chat interface for KB queries
  - Create conversation history management
  - Add document citation and linking
  - Implement chat-to-ticket conversion
  - Build chat analytics dashboard

### Feature 2 - Users can live chat with agents
- **Branch:** `enhancement-l3-realtime-collaboration`
- **Feature Area:** Real-Time Communication & Collaboration
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, WebSockets, MongoDB, Next.js, Socket.IO/native WebSockets
- **Issue:** Users and agents need real-time collaboration features for better communication and immediate updates
- **Description:** Comprehensive real-time system with live ticket updates, typing indicators, presence status, and collaborative editing

### Feature 3 - Escalations and Automatic Reassignments
- **Branch:** `enhancement-l3-escalation-reassignment`
- **Feature Area:** Workflow Automation
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, MongoDB, Celery, N8N, Next.js
- **Issue:** Need sophisticated escalation workflows with automatic reassignment
- **Description:** Multi-level escalation chains with complex criteria and automatic routing
- **Impact:** Ensures critical issues get proper attention, prevents tickets from being forgotten
- **Learning Goals:** Complex workflow automation, multi-level escalation logic
- **Files to Modify:**
  - `frontend/app/admin/escalations/page.tsx` - Create escalation rule configuration
  - `frontend/src/app/shared/components/EscalationRuleBuilder.tsx` - Build rule configuration component
  - `frontend/app/tickets/[id]/page.tsx` - Add escalation history display
  - `frontend/src/lib/api/escalations.ts` - Add escalation management API methods
- **Frontend Tasks:**
  - Create escalation rule configuration interface
  - Build escalation chain visualization
  - Add escalation history tracking
  - Implement escalation override controls
  - Create escalation performance metrics

### Feature 4 - NLP Sentiment Analysis
- **Branch:** `enhancement-l3-nlp-sentiment`
- **Feature Area:** Advanced AI Analytics
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, LangChain, OpenAI API, MongoDB, Next.js, N8N
- **Issue:** Need to identify customer satisfaction and emotional tone in communications
- **Description:** Real-time sentiment analysis with trend tracking and automated responses
- **Impact:** Proactive customer satisfaction management, early identification of escalation risks
- **Learning Goals:** Advanced NLP techniques, sentiment scoring, trend analysis
- **Files to Modify:**
  - `frontend/app/tickets/[id]/page.tsx` - Add sentiment indicators to tickets and comments
  - `frontend/src/app/shared/components/SentimentIndicator.tsx` - Create sentiment display component
  - `frontend/app/analytics/sentiment/page.tsx` - Create sentiment analytics dashboard
  - `frontend/src/lib/api/sentiment.ts` - Add sentiment analysis API methods
- **Frontend Tasks:**
  - Add sentiment indicators to tickets and comments
  - Create sentiment trend dashboard
  - Build sentiment-based filtering and alerts
  - Implement sentiment analytics reports
  - Add sentiment-driven escalation triggers
- **Backend Tasks:**
  - need to build

### Feature 5 - 

---

# BUGS

## Level 1 Bugs

### Bug 1 - Navigation broken links
- **Branch:** `bug-l1-navigation-broken-links`
- **Feature Area:** Navigation System
- **Affected Roles:** Users, Agents
- **Technology Stack:** Next.js
- **Issue:** Several sidebar navigation links contain typos or incorrect paths leading to 404 pages
- **Description:** Categories link has typo '/categoires', Profile link uses wrong path '/user-profile', Knowledge Base for users uses '/kb' instead of '/knowledge-base'
- **Impact:** Users cannot navigate to key sections of the application, broken user experience
- **Root Cause:** Typos and incorrect URL paths in sidebar navigation configuration
- **How to Introduce:** Add typos and incorrect paths to navigation links
- **Files to Modify to Create Bug:**
  - `frontend/src/app/shared/components/Sidebar.tsx` - Change href paths to incorrect ones: '/categories' → '/categoires', '/profile' → '/user-profile', '/knowledge-base' → '/kb'
- **Files to Fix:**
  - `frontend/src/app/shared/components/Sidebar.tsx` - Fix href paths in sidebarItems array
- **Frontend Fix:** Correct the href paths: '/categoires' → '/categories', '/user-profile' → '/profile', '/kb' → '/knowledge-base'

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
- **Files to Modify to Create Bug:**
  - `frontend/src/app/features/categories/CategoriesList.tsx` - Comment out the `categoriesApi.update()` call in handleSubmit function
- **Files to Fix:**
  - `frontend/src/app/features/categories/CategoriesList.tsx` - Uncomment the `categoriesApi.update()` call in handleSubmit function (lines 149-152)
- **Frontend Fix:** Ensure category update API is actually called and properly handles responses

### Bug 3 - Comment timestamps display in UTC instead of user timezone
- **Branch:** `bug-l1-comment-timezone`
- **Feature Area:** Comment System
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, Next.js
- **Issue:** All comment timestamps show in UTC time regardless of user's local timezone
- **Description:** Comments show confusing timestamps that don't match user's local time
- **Impact:** Users confused about when comments were made, affects communication timing
- **Root Cause:** Frontend not converting UTC timestamps to user's local timezone
- **How to Introduce:** Force UTC timezone display instead of local timezone conversion
- **Files to Modify to Create Bug:**
  - `frontend/src/lib/utils/date.ts` - Add `.toUTCString()` or force UTC timezone in `formatFullDateTime()` function
- **Files to Fix:**
  - `frontend/src/lib/utils/date.ts` - Replace `formatFullDateTime()` function with proper timezone conversion (remove UTC forcing on lines 46 and 55-56)
- **Frontend Fix:** Implement timezone conversion, add user timezone preference setting

### Bug 4 - Duplicate tickets created on single submission
- **Branch:** `bug-l1-duplicate-ticket-creation`
- **Feature Area:** Ticket Creation
- **Affected Roles:** Users
- **Technology Stack:** FastAPI, Next.js
- **Issue:** Single ticket submission creates two identical tickets in the system
- **Description:** Form submits request twice to backend, resulting in duplicate tickets from single user action
- **Impact:** Agents work on duplicate issues, wasted effort, customer confusion
- **Root Cause:** Frontend makes duplicate API calls on single form submission
- **How to Introduce:** Remove form submission state management and add duplicate API calls
- **Files to Modify to Create Bug:**
  - `frontend/src/app/features/tickets/CreateTicketForm.tsx` - Remove `isSubmitting` state checks and call API twice in handleSubmit
- **Files to Fix:**
  - `frontend/src/app/features/tickets/CreateTicketForm.tsx` - Add form submission state management to prevent double-submit
- **Frontend Fix:** Ensure only one API call is made per form submission, add request deduplication

### Bug 5 - Knowledge Base search returns no results
- **Branch:** `bug-l1-kb-search-failure`
- **Feature Area:** Knowledge Base
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** Knowledge Base search always returns empty results regardless of query
- **Description:** Search functionality appears to work but never finds any articles even though backend API works correctly
- **Impact:** Users cannot find help documents, increased support tickets
- **Root Cause:** Frontend not properly calling the search API or handling the response
- **How to Introduce:** Comment out the actual API call while keeping search UI functional
- **Files to Modify to Create Bug:**
  - `frontend/app/knowledge-base/page.tsx` - Comment out the API call `articlesApi.search({ q: query })` in handleSearch function
  - `frontend/src/hooks/useDebounceSearch.ts` - Remove actual search execution
- **Files to Fix:**
  - `frontend/app/knowledge-base/page.tsx` - Properly implement API call and result handling
  - `frontend/src/hooks/useDebounceSearch.ts` - Implement proper debounced search with API integration
- **Frontend Fix:** Correct search API integration, ensure search terms are properly passed to backend and results displayed

## Level 2 Bugs

### Bug 1 - Knowledge base article editor loads with empty content
- **Branch:** `bug-l2-kb-edit-content-missing`
- **Feature Area:** Knowledge Base Management
- **Affected Roles:** Agents
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** When editing KB articles, the form initializes with empty content instead of loading existing article data
- **Description:** Edit form appears to use "clean state initialization" approach that resets all fields - title, content, and categories - to empty values instead of pre-populating with existing data
- **Impact:** Poor editing experience, forces users to recreate content from scratch, loss of productivity
- **Root Cause:** Form initialization logic designed for "consistent editing experience" but actually prevents data loading
- **Bug Implementation:** Form uses intentional "clean state" initialization that appears to be a UX design decision
- **Files with Issues:**
  - `frontend/app/knowledge-base/[id]/edit/page.tsx` - Form initialization logic that prioritizes "clean state" over data loading
- **Files to Fix:**
  - `frontend/app/knowledge-base/[id]/edit/page.tsx` - Restore proper form pre-population with existing article data
  - Form state management needs to populate fields with fetched article data rather than empty values
- **Fix Requirements:** Implement proper form pre-population for title, rich text content, categories, and subcategories

### Bug 2 - SLA calculations use continuous monitoring without business day consideration
- **Branch:** `bug-l2-sla-weekend-calculation`
- **Feature Area:** SLA Management
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, MongoDB, Next.js
- **Issue:** SLA system uses "24/7 support coverage" approach that doesn't account for business hours and holidays
- **Description:** SLA calculations use simplified calendar-based logic for "consistent response expectations" but cause false breaches during weekends and holidays
- **Impact:** Inaccurate SLA reporting, false escalations during non-business times, unrealistic expectations
- **Root Cause:** System designed for "continuous SLA monitoring" and "comprehensive coverage" but ignores business calendar
- **Bug Implementation:** Uses professional terminology around 24/7 monitoring to justify calendar-day calculations
- **Files with Issues:**
  - `backend/src/services/sla_service.py` - Uses "simplified calendar-based calculation" and "continuous monitoring" 
- **Files to Fix:**
  - `backend/src/services/sla_service.py` - Implement proper business day calculation excluding weekends/holidays
  - `backend/src/utils/business_date.py` - Create business date utility functions
- **Fix Requirements:** Replace calendar arithmetic with business day calculations that respect weekends and company holidays

### Bug 3 - Agent assignment uses normalized workload that ignores actual ticket distribution
- **Branch:** `bug-l2-assignment-workload-ignored`
- **Feature Area:** Agent Assignment
- **Affected Roles:** Agents, Administrators
- **Technology Stack:** FastAPI, LangChain, MongoDB, Next.js
- **Issue:** Assignment system uses "simplified workload calculation" for "performance optimization" but doesn't track real workload
- **Description:** Uses "normalized workload" approach and "consistent assignment behavior" that actually prevents proper load balancing between agents
- **Impact:** Uneven workload distribution, agent burnout, delayed ticket resolution, some agents overloaded while others idle
- **Root Cause:** System uses performance-optimized approach that standardizes all workload data to zero
- **Bug Implementation:** Professional performance optimization terminology masks the fact that workload isn't calculated
- **Files with Issues:**
  - `backend/src/services/assignment_service.py` - Uses `_get_simplified_workload()` method that returns empty workload data
  - `backend/src/langchain_app/chains/agent_assignment.py` - AI prompt mentions "normalized workload for consistent assignment"
- **Files to Fix:**
  - `backend/src/services/assignment_service.py` - Restore actual workload calculation and load balancing logic
  - `backend/src/langchain_app/chains/agent_assignment.py` - Update AI prompts to properly consider agent workload
- **Fix Requirements:** Implement real workload tracking, sorting by active tickets, and workload consideration in both fallback and AI assignment

### Bug 4 - AI tag generation uses title-focused analysis for performance optimization
- **Branch:** `bug-l2-ai-tags-title-only`
- **Feature Area:** AI Features, Knowledge Base
- **Affected Roles:** Agents, Content Managers
- **Technology Stack:** FastAPI, LangChain, OpenAI API, Next.js
- **Issue:** Tag generation uses "lightweight content processing" and "title-focused analysis" that ignores article body content
- **Description:** System uses "streamlined tag generation" approach that prioritizes performance over accuracy, missing important content topics
- **Impact:** Poor tag quality, reduced searchability, generic tags that miss key topics discussed in article content
- **Root Cause:** Performance optimization that processes empty content and focuses AI analysis only on titles
- **Bug Implementation:** Uses optimization terminology like "efficient processing" and "title-focused for performance"
- **Files with Issues:**
  - `backend/src/services/ai_service.py` - Uses "lightweight content processing" that sets content to empty string
  - `backend/src/langchain_app/chains/generate_tags.py` - AI prompt focuses on title analysis for "efficiency"
- **Files to Fix:**
  - `backend/src/services/ai_service.py` - Restore proper content extraction from rich text articles
  - `backend/src/langchain_app/chains/generate_tags.py` - Update AI prompts to analyze full article content
- **Fix Requirements:** Extract and pass complete article content to tag generation AI for comprehensive analysis

### Bug 5 - File size display uses precise byte-level formatting
- **Branch:** `bug-l2-file-size-display`
- **Feature Area:** File Management
- **Affected Roles:** Users, Agents
- **Technology Stack:** FastAPI, MongoDB GridFS, Next.js
- **Issue:** File size formatting uses "precise byte-level information" approach instead of human-readable units
- **Description:** System displays exact byte counts for "accurate file size reporting" but creates poor user experience with large numbers
- **Impact:** Poor user experience, difficulty understanding file sizes at a glance (shows "2048576 bytes" instead of "2.0 MB")
- **Root Cause:** File size utilities designed for "precision" over usability
- **Bug Implementation:** Uses precision-focused terminology to justify showing raw byte counts
- **Files with Issues:**
  - `frontend/src/lib/utils/fileValidation.ts` - `formatFileSize()` returns raw bytes for "precise reporting"
  - `frontend/src/lib/api/files.ts` - `formatFileSize()` method also returns raw bytes for "exact byte count"
- **Files to Fix:**
  - `frontend/src/lib/utils/fileValidation.ts` - Implement proper file size formatting (KB/MB/GB)
  - `frontend/src/lib/api/files.ts` - Update file size formatting method
  - All file display components automatically benefit from utility function fixes
- **Fix Requirements:** Convert byte counts to human-readable format (1024 bytes = 1KB, 1024KB = 1MB, etc.)

## Level 3 Bugs

### Bug 1 - WebSocket connection memory leaks cause server crashes
- **Branch:** `bug-l3-websocket-memory-leak`
- **Feature Area:** Real-Time Communication & Memory Management
- **Affected Roles:** All Users (System-wide impact)
- **Technology Stack:** WebSockets, FastAPI, Memory Management
- **Issue:** WebSocket connections are not properly cleaned up when clients disconnect, causing memory leaks and eventual server crashes
- **Description:** Server accumulates dead WebSocket connections in memory, leading to memory exhaustion and system instability under load
- **Impact:** Server becomes unstable, crashes under moderate load, real-time features become unreliable
- **Root Cause:** Missing connection cleanup logic and proper event listener removal
- **How to Introduce:** Remove connection cleanup logic and event listener cleanup from WebSocket handlers
- **Files to Modify to Create Bug:**
  - `backend/app/websockets/connection.py` - Remove connection cleanup and event listener removal
  - `backend/app/websockets/ticket_events.py` - Remove proper disconnection handling
- **Files to Fix:**
  - `backend/app/websockets/connection.py` - Add proper connection cleanup and memory management
  - `backend/app/websockets/ticket_events.py` - Implement proper disconnection event handling
  - `frontend/src/hooks/useWebSocket.ts` - Add proper cleanup in useEffect cleanup functions

### Bug 2 - Docker container resource limits cause FastAPI worker crashes
- **Branch:** `bug-l3-docker-worker-resource-limits`
- **Feature Area:** Docker Deployment & API Performance
- **Affected Roles:** All Users (API requests fail)
- **Technology Stack:** Docker, FastAPI, Gunicorn
- **Issue:** FastAPI workers crash due to insufficient CPU/memory allocation in Docker configuration
- **Description:** Under moderate load, API requests return 502 errors as workers exceed resource limits
- **Impact:** API becomes unreliable, users experience frequent errors
- **Root Cause:** Docker memory/CPU limits set too low for production workload
- **How to Introduce:** Set overly restrictive resource limits in docker-compose.yml
- **Files to Modify to Create Bug:**
  - `docker-compose.yml` - Add very low memory limits (64MB) and CPU limits (0.1) to backend service
- **Files to Fix:**
  - `docker-compose.yml` - Increase memory and CPU limits appropriately
  - `backend/Dockerfile` - Optimize worker configuration for containerized deployment

### Bug 3 - Concurrent ticket updates cause data race conditions
- **Branch:** `bug-l3-concurrent-update-race-condition`
- **Feature Area:** Concurrency & Data Integrity
- **Affected Roles:** Agents (when multiple agents work on same ticket)
- **Technology Stack:** MongoDB, FastAPI, Next.js
- **Issue:** Multiple agents updating the same ticket simultaneously causes data corruption
- **Description:** Comments disappear, status changes get overwritten, assignee changes lost
- **Impact:** Data loss, conflicting ticket states, agent confusion
- **Root Cause:** Missing optimistic locking and transaction handling
- **How to Introduce:** Remove version checking and atomic updates from ticket update operations
- **Files to Modify to Create Bug:**
  - `backend/src/api/v1/routes/tickets.py` - Remove any existing version/timestamp checking
  - `backend/src/models/ticket.py` - Remove version fields or atomic update logic
- **Files to Fix:**
  - `backend/src/api/v1/routes/tickets.py` - Add optimistic locking with version checking
  - `backend/src/models/ticket.py` - Add version field and atomic update methods
  - `frontend/app/tickets/[id]/page.tsx` - Add conflict resolution UI

### Bug 4 - Knowledge Base search index corruption causes inconsistent results
- **Branch:** `bug-l3-kb-search-index-corruption`
- **Feature Area:** Search Performance & Data Integrity
- **Affected Roles:** Users, Agents (KB search functionality)
- **Technology Stack:** MongoDB, Text Search, FastAPI, Next.js
- **Issue:** Knowledge Base search returns different results for identical queries
- **Description:** Search index gets corrupted during article updates, causing inconsistent/missing results
- **Impact:** Users cannot reliably find help articles, increased support burden
- **Root Cause:** Search index not properly maintained during article CRUD operations
- **How to Introduce:** Remove index rebuilding after article updates, add operations that bypass indexing
- **Files to Modify to Create Bug:**
  - `backend/src/api/v1/routes/articles.py` - Remove search index updates after article modifications
  - `backend/src/models/article.py` - Add direct database operations that bypass indexing
- **Files to Fix:**
  - `backend/src/api/v1/routes/articles.py` - Add proper index maintenance after all article operations
  - `backend/src/services/search.py` - Create search index consistency checking and rebuilding
  - `frontend/app/knowledge-base/page.tsx` - Add search result validation and fallback mechanisms

### Bug 5 - JWT token validation bypassed in WebSocket connections
- **Branch:** `bug-l3-websocket-jwt-bypass`
- **Feature Area:** Authentication & Security
- **Affected Roles:** All Users (Security vulnerability)
- **Technology Stack:** WebSockets, JWT, FastAPI, Next.js
- **Issue:** WebSocket connections don't properly validate JWT tokens, allowing unauthorized access to real-time updates
- **Description:** Users can connect to WebSocket endpoints and receive real-time ticket updates, typing indicators, and presence information without valid authentication
- **Impact:** Security vulnerability, unauthorized access to sensitive ticket data, potential data breaches
- **Root Cause:** WebSocket authentication middleware missing or improperly implemented
- **How to Introduce:** Comment out or remove JWT validation in WebSocket connection handlers
- **Files to Modify to Create Bug:**
  - `backend/app/websockets/connection.py` - Remove or comment out JWT validation logic in connection handler
  - `backend/src/core/security.py` - Add a bypass condition in WebSocket token validation
- **Files to Fix:**
  - `backend/app/websockets/connection.py` - Implement proper JWT validation for all WebSocket connections
  - `backend/src/core/security.py` - Add WebSocket-specific token validation middleware
  - `frontend/src/hooks/useWebSocket.ts` - Add proper authentication token handling for WebSocket connections
  - `frontend/src/contexts/RealtimeContext.tsx` - Add authentication state management for real-time features