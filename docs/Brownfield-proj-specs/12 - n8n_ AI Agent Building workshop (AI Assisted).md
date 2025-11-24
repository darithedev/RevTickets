#### **n8n: AI Agent Building workshop (AI Assisted)**

## Learning Objectives

By the end of this module, learners will be able to:

1. Understand the purpose and functionality of the **AI Agent node** in n8n (specifically the Tools Agent type).  
2. Recognize how the node can autonomously select and use tools to accomplish tasks.  
3. Apply the AI Agent node to build an intelligent ticketing system that categorizes and routes support tickets autonomously.  
4. Implement the Tools Agent within a ticketing workflow, including setup, configuration, and tool invocation.

## Description

The **AI Agent node** in n8n is a built-in, autonomous workflow element that combines Large Language Models (LLMs) with a variety of tools and logic. It leverages **LangChain**'s abstraction to decide which tools to call and orchestrate multi-step reasoning without manually wiring each action. As of version 1.82.0, the node uses the unified **Tools Agent** type, replacing older agent variants like ReAct or SQL Agent.

**Core capabilities include:**

* **Tool orchestration**: Choose from an extensive list of built-in tools—HTTP Request, workflows, databases, SaaS integrations (e.g., Slack, Google Sheets, Zendesk), local code execution, and more .  
* **Prompt control**: Configure the prompt source and system messaging, enforce output formats, and manage iteration limits and intermediate reasoning.  
* **Conversational memory**: Pair the Agent node with a Chat Trigger and memory sub-node for context-aware workflows, although persistent memory across sessions isn’t automatic .

## Real-World Example: AI Agent for Ticketing System

**Use Case:**  
An employee submits a support ticket (e.g., "VPN not connecting"). The **AI Agent node** processes the input, summarizes the issue, classifies the ticket into categories (e.g., Network, Access), determines if automated resolution is possible, and then routes the ticket to the appropriate team or takes action.

**Benefits:**

* Reduces manual triage efforts.  
* Delivers faster and consistent resolution.  
* Scales with minimal additional human oversight.

## Analogy

Think of the AI Agent node as a **smart dispatcher** in a busy command center:

* Incoming reports (tickets) arrive.  
* The dispatcher listens, summarizes the issue, and decides which specialized unit (team or action) to send it to.  
* Sometimes, the dispatcher can handle the task directly (auto-resolution).  
  This intelligent dispatcher speeds up response and ensures accuracy—much like the AI Agent node in n8n.

Instructions

### Step 1: Create a New Workflow & Webhook Trigger

**Webhook Node**: Set method POST, path /ticket, expecting JSON input:  
{  
  "ticket\_id": "1001",  
  "description": "Cannot access email after password reset."  
}

*  

### Step 2: Add the AI Agent (Tools Agent) Node

* Drag in the **AI Agent node** (Tools Agent by default) .  
* **Connect** at least one tool sub-node (e.g., HTTP Request, Code, Call Workflow) for actions.

### Step 3: Configure Agent Parameters

* **Prompt Source**: "Define below" with dynamic expression like {{$json\["description"\]}}.  
* **System Message**: Provide operational instructions, e.g., *“Classify tickets into categories: Network, Access, Hardware, Software. Summarize issue in one sentence.”*  
* **Require Specific Output Format**: Enable and specify a parser (e.g., Structured Output Parser) for clean JSON extraction.  
* **Max Iterations**: Set e.g., to 5 to prevent loops.  
* **Return Intermediate Steps**: Optional; helpful for debugging.

### Step 4: Attach Tools

Design tools the agent may use:

* **Call Workflow** sub-workflows for each route (e.g., “Assign to Network Team”).  
* **Email** or Logging actions for automated resolution.  
* **HTTP Request** or database if storing records.  
  As users note, building tools as separate sub-workflows via Execute Sub-workflow allows reuse and clean separation.

### Step 5: Workflow Response

After agent processing, add a **Set Node** to format output:

{  
  "ticket\_id": "{{$json\["ticket\_id"\]}}",  
  "summary": "{{$json\["agent\_summary"\]}}",  
  "category": "{{$json\["agent\_category"\]}}",  
  "status": "{{$json\["agent\_decision"\]}}"  
}

Then use a **Webhook Response Node** to return the structured output.

### Step 6: Test & Iterate

* Activate the workflow.  
* Submit test tickets via curl or Postman.  
* Examine outputs and adjust prompts, tool definitions, or output format settings as needed.

References  
 https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/  
