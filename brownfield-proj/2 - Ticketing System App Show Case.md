#### **Ticketing System App Show Case**

### Project: Enterprise Ticketing System – Brownfield Development

This project focuses on brownfield development of an existing enterprise ticketing system. The goal is to enhance the system by fixing bugs, implementing feature improvements, and ensuring stable operation, rather than building a new system from scratch.

**Approach:**

1. **Analysis:** Review the existing codebase, understand workflows, and identify dependencies.  
2. **Implementation:** Address the provided three levels of bugs and three levels of enhancements.

# Ticketing System \- Full Stack Application

A comprehensive AI-powered ticketing system with intelligent queue management, built with FastAPI backend and Next.js frontend.

## Quick Start

**Just run one command to start everything:**

docker-compose up \--build

This will automatically:

* Start MongoDB database  
* Start FastAPI backend with seed data  
* Start Next.js frontend  
* Create demo users and sample tickets

## Access the Application

* **Frontend**: [http://localhost:3000](http://localhost:3000/)  
* **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)  
* **MongoDB**: localhost:27017

## Demo Login Credentials

### Regular Users:

* john.doe@company.com / password123  
* jane.smith@company.com / password123  
* mike.johnson@company.com / password123

### Agents (Full Access):

* sarah.wilson@company.com / password123  
* david.brown@company.com / password123  
* lisa.davis@company.com / password123

## Key Features

* **Authentication**: JWT-based login with role-based access  
* **Ticket Management**: Create, view, and manage support tickets  
* **Categories System**: Organize tickets with categories, subcategories, and tags  
* **User Roles**: Regular users and agents with different permissions  
* **Responsive Design**: Works on desktop and mobile  
* **Dark Mode**: Built-in theme switching

## Tech Stack

* **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, Flowbite  
* **Backend**: FastAPI, Python, Beanie ODM  
* **Database**: MongoDB  
* **Authentication**: JWT tokens  
* **Deployment**: Docker & Docker Compose

## Project Structure

├── frontend/          \# Next.js React application  
├── backend/           \# FastAPI Python application  
├── docker-compose.yml \# Docker orchestration  
└── README.md         \# This file

## Development

### Prerequisites

* Docker and Docker Compose  
* (Optional) Node.js 18+ and Python 3.11+ for local development

### Running in Development Mode

**Option 1: Full Docker (Recommended)**

docker-compose up \--build

**Option 2: Local Development**

\# Backend  
cd backend  
pip install \-r requirements.txt  
python src/seed\_data.py  \# Run once to create demo data  
uvicorn main:app \--reload

\# Frontend (new terminal)  
cd frontend  
npm install  
npm run dev

## Demo Data

The application automatically creates:

* 6 demo users (3 regular users, 3 agents)  
* Sample categories (Technical Support, Account Management, General Inquiry)  
* Demo tickets with various statuses and priorities  
* Tags for organization (department, priority, type)

## Production Deployment

The application is containerized and ready for production deployment:

docker-compose up \-d

## API Documentation

When running, visit [http://localhost:8000/docs](http://localhost:8000/docs) for interactive API documentation.

