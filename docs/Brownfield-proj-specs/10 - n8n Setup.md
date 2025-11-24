#### **n8n Setup**

## Learning Objectives

1. Understand what n8n is and why it is used for workflow automation.  
2. Identify real-world use cases where n8n can add value.  
3. Relate n8n workflows to familiar analogies for better conceptual clarity.  
4. Successfully install, configure, and run n8n on their system using different deployment methods.

## Description

**n8n** (short for “nodemation”) is an open-source workflow automation tool that allows users to connect different applications, APIs, and services without extensive coding. It provides a low-code environment where tasks such as data synchronization, notification triggers, or process automation can be designed visually.

Unlike proprietary automation tools, n8n is **self-hostable**, giving organizations more control over their data and infrastructure. It supports over 300 integrations (e.g., Slack, Google Sheets, GitHub, databases, custom APIs) and enables advanced workflows through conditional logic, loops, and error handling.

## Real-World Example

Imagine a small e-commerce business that receives orders through Shopify. Each time a new order is placed:

* Order details need to be logged in a Google Sheet for accounting.  
* A Slack message must notify the sales team.  
* Customer details should be added to a CRM like HubSpot.

Without automation, this process would require manual copy-paste tasks, increasing error chances. With n8n, a workflow can automatically connect Shopify → Google Sheets → Slack → HubSpot, ensuring real-time updates with zero manual intervention.

## Analogy

Think of n8n as a **digital assembly line in a factory**. Each station (node) on the line performs a specific action, such as receiving an item, modifying it, or forwarding it to the next station. The conveyor belt connecting the stations is the workflow logic. Just like a physical assembly line makes manufacturing efficient, n8n makes digital processes seamless and consistent.

Instructions

### 1\. Docker Setup (Recommended for Production)

1. Ensure Docker is installed and running.  
2. Create a directory for n8n:

mkdir n8n-docker && cd n8n-docker

        3\. Run n8n with Docker: 

docker volume create n8n\_data

docker run \-it \--rm \\  
 \--name n8n \\  
 \-p 5678:5678 \\  
 \-e GENERIC\_TIMEZONE="\<YOUR\_TIMEZONE\>" \\  
 \-e TZ="\<YOUR\_TIMEZONE\>" \\  
 \-e N8N\_ENFORCE\_SETTINGS\_FILE\_PERMISSIONS=true \\  
 \-e N8N\_RUNNERS\_ENABLED=true \\  
 \-v n8n\_data:/home/node/.n8n \\  
 docker.n8n.io/n8nio/n8n

        4\. Access n8n at:

http://localhost:5678

### **Method 2: Docker Compose (For Persistent Setup)**

Add n8n service to the docker-compose.yml file:  
version: '3'  
services:  
  n8n:  
    image: n8nio/n8n  
    ports:  
      \- "5678:5678"  
    volumes:  
      \- \~/.n8n:/home/node/.n8n  
    environment:  
      \- N8N\_BASIC\_AUTH\_ACTIVE=true  
      \- N8N\_BASIC\_AUTH\_USER=admin

1.       \- N8N\_BASIC\_AUTH\_PASSWORD=securepassword  
      
2. Start the services:  
   docker-compose up \-d  
      
3. n8n will be available with authentication enabled.

