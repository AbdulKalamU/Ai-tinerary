<div align="center">
  <br />
  <h1>🌍 AI Travel Planner</h1>
  <p><strong>An Intelligent, Full-Stack Travel Orchestration Platform</strong></p>

  [![Java](https://img.shields.io/badge/Java-17%2B-orange.svg?style=for-the-badge&logo=java)](https://openjdk.org/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.0-brightgreen.svg?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
  [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black.svg?style=for-the-badge&logo=vercel)](https://vercel.com/)
  [![Render](https://img.shields.io/badge/Backend_on-Render-46E3B7.svg?style=for-the-badge&logo=render)](https://render.com/)
</div>

<br/>

## 📖 Overview

Traditional travel planning is highly fragmented, forcing users to juggle multiple tabs across blogs, maps, and budgeting tools. **AI-Tinerary** solves this by leveraging Large Language Models (LLMs) to generate highly detailed, personalized, day-by-day travel itineraries in seconds.

Built with a decoupled **React** frontend and an enterprise-grade **Java Spring Boot** REST API, this platform showcases advanced backend orchestration, relational database design, secure authentication, and resilient API fallback mechanisms.

---

## ✨ Core Features & Engineering Highlights

### 1. AI Orchestration & Fallback Resilience
The backend integrates with both **Google Gemini** and **Groq (LLaMA 3.1)** APIs. Using a custom `ModelRouter`, the system employs a resilient fallback mechanism. If the primary AI provider experiences downtime or rate limits, the request is instantly rerouted to the secondary provider, ensuring 99.9% uptime for the user without any visible error screens.

### 2. Relational Database & Entity Cascading
Powered by **Supabase PostgreSQL**, the database schema is highly relational (`User` → `TravelPlan` → `ItineraryDay` → `Activity`). Utilizing **Hibernate/JPA**, the backend enforces strict referential integrity. Deleting a travel plan automatically cascades to remove all associated days and activities (`orphanRemoval = true`), eliminating orphaned data and optimizing storage.

### 3. JWT Stateless Authentication
Security is enforced using **Spring Security**. User passwords are encrypted via **BCrypt** before database persistence. Client-server sessions are authorized using stateless **JSON Web Tokens (JWT)**, intercepting and verifying the signature on every secure HTTP request.

### 4. Interactive Spatial Mapping
The frontend integrates **Leaflet.js** and **OpenStreetMap**. As the AI generates specific activities, the exact latitude and longitude coordinates are parsed and dynamically plotted as interactive markers on a sticky map panel alongside the itinerary timeline.

### 5. Google Places API Integration
To provide high-quality visual context, the application queries the **Google Places API** to dynamically fetch beautiful, location-specific photography for every generated tourist attraction and restaurant on the itinerary.

---

## 📸 Application Showcase

> **Note to recruiters/developers:** 
> *Please refer to the repository assets for high-quality screenshots of the working application.*

<div align="center">
  <img
    src="https://github.com/user-attachments/assets/5f6ef5c2-b854-40c4-9b0a-930d79a93d40"
    alt="Landing Page"
    width="800"
  />
  <p><em>The landing page.</em></p>

  <br/>

  <img
    src="https://github.com/user-attachments/assets/5d5c205a-f40f-427f-9058-2f2c716f3aee"
    alt="Dashboard"
    width="800"
  />
  <p><em>Dashboard.</em></p>
</div>

---

## 🏗️ Project Architecture

```mermaid
graph TD
    classDef user fill:#8a2be2,stroke:#333,stroke-width:2px,color:#fff
    classDef frontend fill:#000000,stroke:#333,stroke-width:2px,color:#fff
    classDef api fill:#e67e22,stroke:#333,stroke-width:2px,color:#fff
    classDef backend fill:#6db33f,stroke:#333,stroke-width:2px,color:#fff
    classDef db fill:#3fcf8e,stroke:#333,stroke-width:2px,color:#000
    classDef ai fill:#ff9900,stroke:#333,stroke-width:2px,color:#000
    classDef external fill:#95a5a6,stroke:#333,stroke-width:2px,color:#fff

    User(("👤 Traveler")):::user

    subgraph Presentation Layer [🌐 Frontend - Hosted on Vercel]
        UI["React / Vite App"]:::frontend
        MapEngine["Spatial Engine: Leaflet"]:::frontend
    end

    User -->|Requests Itinerary| UI
    UI <--> MapEngine

    subgraph Business Logic Layer [☕ Spring Boot Backend - Hosted on Render]
        Auth["JWT Security Filter"]:::api
        Controller["REST Controllers"]:::backend
        Service["TravelPlan Service"]:::backend
        Orchestrator["🧠 AI Prompt Orchestrator"]:::backend
    end

    UI -->|HTTP POST + JWT| Auth
    Auth --> Controller
    Controller --> Service
    Service --> Orchestrator

    subgraph External Data APIs
        OSM["OpenStreetMap API"]:::external
        Places["Google Places API"]:::external
    end
    
    MapEngine -.->|Map Tiles| OSM
    Service -.->|Fetch Photos| Places

    subgraph AI Provider Fallback Chain
        Gemini["Google Gemini (Primary)"]:::ai
        Groq["Groq LLaMA (Fallback)"]:::ai
    end
    
    Orchestrator -.->|Primary Request| Gemini
    Orchestrator -.->|Fallback on Fail| Groq

    subgraph Persistence Layer [🗄️ Supabase]
        SQL[("PostgreSQL")]:::db
    end
    
    Service --> SQL
```

---

## ⚙️ DevOps & CI/CD Pipeline

To ensure production stability, the repository uses **GitHub Actions** for Continuous Integration.
1. **Automated Testing:** On every `git push`, the CI pipeline runs a suite of backend unit tests (**JUnit 5** & **Mockito**) and frontend End-to-End browser tests (**Cypress**).
2. **Automated Deployment:** Upon passing tests, webhooks automatically trigger new production builds on **Vercel** (frontend) and **Render** (backend).

---

## 💻 Local Setup Guide

Follow these steps to run the project locally on your machine.

### Prerequisites
*   **Java 17** or higher
*   **Node.js** (v18+)
*   An API key from [Google Gemini](https://aistudio.google.com/) or [Groq](https://console.groq.com/)
*   A local PostgreSQL database or Supabase connection.

### Step 1: Clone & Configure
```bash
git clone https://github.com/AbdulKalamU/Ai-tinerary.git
cd Ai-tinerary
```
Open `src/main/resources/application.properties` and add your database credentials and API keys.

### Step 2: Start the Java Backend
```bash
# Downloads Maven dependencies and starts the Spring Boot server on port 8080
./mvnw spring-boot:run
```

### Step 3: Start the React Frontend
Open a new terminal tab and run:
```bash
cd frontend-react
npm install
npm run dev
```
*The application will now be running at `http://localhost:5173`!*

---
<div align="center">
  <p>Built with ❤️ for travelers everywhere.</p>
</div>
