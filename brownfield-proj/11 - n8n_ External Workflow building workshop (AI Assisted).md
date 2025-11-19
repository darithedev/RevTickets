#### **n8n: External Workflow building workshop (AI Assisted)**

## Learning Objectives

1. Understand the role of **OpenAI nodes** in n8n for integrating LLMs without external HTTP nodes.  
2. Explore the capabilities of OpenAI nodes such as **Assistant**, **Chat Model**, **Text**, **Image**, and **Embeddings**.  
3. Design a self-contained workflow to process input using an LLM with just native nodes.  
4. Implement a practical example using the **OpenAI Text or Chat Model node** for standalone LLM interactions.

## Description

n8n provides native integration with OpenAI through built-in nodes like the **OpenAI** and **OpenAI Chat Model**. These nodes allow workflows to leverage OpenAI services—like chat, text completions, summarization, image generation, audio transcription, and embeddings—without requiring manual HTTP requests or external integrations.

Key features include:

* **Assistant operations**: Create, message, and manage assistants directly within a workflow .  
* **Text operations**: Use LLMs for completions, classification, or content generation conveniently .  
* **Chat Model node**: Comprehensive options for using OpenAI’s chat-capable models with control over model parameters .  
* **Embeddings node**: Generate text embeddings (useful for semantic tasks) directly in workflows .

Using these nodes gives a more streamlined, reliable, and feature-rich alternative to raw HTTP calls.

## Real-World Use Case

**Use Case: Automated Ticket Summary Generator**  
A support ticket is submitted via webhook. Instead of manually handling the logic, the workflow uses an OpenAI Chat Model node to summarize the ticket description into a concise format. No external HTTP Request needed—just native node logic.

**Benefits**:

* Simplified node management and fewer manual steps.  
* Access to advanced model parameters like temperature, max tokens, and response formatting.  
* Cleaner workflows with robust error handling and native integrations.

## Analogy

Imagine the OpenAI node as a **specialized assistant desk** inside n8n: you walk up, hand over your message, and the assistant (LLM) replies—formatted, sensible, and polished. You don't need to send letters through a courier (HTTP); the assistant desk handles everything inside.

Instructions

### Step 1: Set Up Workflow & Webhook Trigger

* Start a new workflow.  
* Add a **Webhook Trigger** node:  
  * Method: POST  
  * Path: /ticket-summary

Sample input:  
{  
  "ticket\_id": "789",  
  "description": "I get a 404 error when I try accessing the reports dashboard."  
}

*  

### Step 2: Use OpenAI Chat Model Node

* Add the **OpenAI Chat Model** node.  
* Configure basic settings:  
  * **Model**: Choose from available GPT models (e.g., gpt-5, gpt-4o).

**Prompt**: Use the ticket description:  
Summarize the following ticket in one sentence: {{$json\["description"\]}}

*    
  * Adjust **temperature**, **max tokens**, and other parameters to refine responses.

### Step 3: Format Summary Output

Add a **Set Node** to extract and structure the response:  
{  
  "ticket\_id": "{{$json\["ticket\_id"\]}}",  
  "summary": "{{$json\["choices"\]\[0\]\["message"\]\["content"\]}}"  
}

*  

### Step 4: Return the Result

* Use a **Webhook Response** node to send back the formatted output to the caller.

References  
 https://n8n.io/integrations/claude/and/openai/  
