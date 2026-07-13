<div align="center">
  <h1>🌍 AI-Tinerary</h1>
  <p><strong>The Future of AI-Powered Travel Planning</strong></p>

  [![Java](https://img.shields.io/badge/Java-17%2B-orange.svg?style=for-the-badge&logo=java)](https://openjdk.org/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.0-brightgreen.svg?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
</div>

<br/>

AI-Tinerary isn't just another travel app—it's a **context-aware, highly-resilient travel architect**. By leveraging multiple Large Language Models and a custom Retrieval-Augmented Generation (RAG) pipeline, it instantly synthesizes complex travel variables into beautiful, interactive, and personalized itineraries.

---

## 🏗️ Project Architecture Pipeline

GitHub natively renders this architecture diagram! It showcases how our modern stack handles data flow from the user all the way to our dynamic AI fallback router.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    classDef server fill:#6db33f,stroke:#333,stroke-width:2px,color:#fff
    classDef ai fill:#ff9900,stroke:#333,stroke-width:2px,color:#000
    classDef db fill:#336791,stroke:#333,stroke-width:2px,color:#fff

    User((👤 Traveler)) -->|Interacts| UI
    
    subgraph Frontend [🌐 React / Vite Frontend]
        UI[Interactive UI & Forms]:::client
        Maps[Leaflet Maps & 3D Globe]:::client
        UI <--> Maps
    end
    
    UI -->|REST API / JWT| API
    
    subgraph Backend [☕ Spring Boot 3 Backend]
        API[Spring Web Controllers]:::server
        Security[Spring Security & JWT]:::server
        Router[🧠 AI Model Router]:::server
        RAG[Hibernate Vector RAG]:::server
    end
    
    API --> Security
    Security --> Router
    Security --> RAG
    
    subgraph AI [🤖 Pluggable AI Providers]
        Groq[Groq LLaMA 3.3]:::ai
        OpenAI[OpenAI GPT-4o]:::ai
        Gemini[Google Gemini 2.5]:::ai
    end
    
    Router -.->|1. Primary| Groq
    Router -.->|2. Fallback| OpenAI
    Router -.->|3. Fallback| Gemini
    
    subgraph Database [🗄️ Persistence Layer]
        SQL[(PostgreSQL Core Data)]:::db
        Vector[(Vector Embeddings)]:::db
    end
    
    Security --> SQL
    RAG --> Vector
```

---

## 🚀 Step-by-Step Quick Start

Want to run this beast locally? Follow these simple steps.

### Step 1: Clone & Configure
First, get the code on your local machine and set up your environment variables.
```bash
git clone https://github.com/AbdulKalamU/Ai-tinerary.git
cd Ai-tinerary
cp .env.example .env.local
```
> 🔑 **Important:** Open `.env.local` and add at least one AI API key (Groq, OpenAI, or Gemini) and a secure JWT Secret string.

### Step 2: Ignite the Backend
Our Java Spring Boot server handles all the heavy lifting, security, and AI routing.
```bash
# Run the Maven wrapper to start the Spring Boot app
./mvnw spring-boot:run
```
*The backend will boot up on `http://localhost:8080`. It uses an in-memory H2 database by default, so no local SQL installation is required!*

### Step 3: Launch the Frontend
In a **new terminal window**, spin up the React interface.
```bash
cd frontend-react
npm install
npm run dev
```
*The Vite dev server will start at `http://localhost:5173`. Open this in your browser to see the magic.*

---

## 🤝 How to Contribute

This is an open-source project and we would absolutely love your help! Whether you want to improve the AI prompts, add new 3D globe features, or fix a CSS bug, here is how you do it:

1. **Fork** this repository to your own GitHub account.
2. **Clone** your fork to your computer.
3. **Create a branch** for your feature: `git checkout -b feature/MyAwesomeFeature`
4. **Code your heart out!**
5. **Commit your changes**: `git commit -m 'Added an awesome feature'`
6. **Push to your fork**: `git push origin feature/MyAwesomeFeature`
7. **Open a Pull Request** back to our `main` branch.

### 🌟 What we need help with right now:
* Replacing H2 database with full PostgreSQL support in Docker.
* Adding a "Download to PDF" feature for generated itineraries.
* Improving the mobile-responsiveness of the 3D globe.

## 📄 License
This project is open-source and licensed under the **MIT License**. Feel free to use it, break it, and build upon it!
