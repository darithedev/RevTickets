#### **System Architecture Showcase**

## **System Architecture Overview**

### High-Level Architecture

**CLIENT TIER**

* Web Browser (Desktop)  
* Mobile Browser (Responsive)  
* Mobile App (Future)

Connected via HTTP/HTTPS and WebSocket (Future) to:

**PRESENTATION TIER**

* Next.js Frontend containing:  
  * Pages (Routes)  
  * Components (UI)  
  * Hooks (Logic)  
  * Context (State)  
  * Services (API)  
  * Constants (Config)

Connected via REST API/JSON to:

**APPLICATION TIER**

* FastAPI Backend containing:  
  * API Routes (Endpoints)  
  * Services (Business Logic)  
  * AI Engine (LangChain)  
  * Models (Data)  
  * Schemas (Validation)  
  * Utilities (Security)

Connected via Database Queries/Document Operations to:

**DATA TIER**

* MongoDB (Primary Database)  
  * Users, Tickets, Categories, Articles  
* Vector Store (AI/Search)  
  * Embeddings, Vectors, Knowledge  
* File Store (Future)  
  * Uploads, Documents, Images

### Infrastructure Architecture

**DEPLOYMENT ARCHITECTURE**

Docker Compose orchestrating:

* Frontend Service: Next.js on Port 3000  
* Backend Service: FastAPI on Port 8000  
* Database Service: MongoDB on Port 27017

All connected via Internal Network (docker-compose network)

External Services (Future integrations):

* CDN for content delivery  
* AI APIs (OpenAI)  
* Monitoring services

