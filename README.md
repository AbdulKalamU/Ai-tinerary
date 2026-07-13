# 🌍 AI-Tinerary: AI-Powered Travel Planner

[![Java](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

AI-Tinerary is a full-stack web application that generates personalized, interactive travel itineraries using AI. It leverages an advanced RAG (Retrieval-Augmented Generation) pipeline and seamlessly falls back across multiple AI providers (Groq, OpenAI, Gemini) to guarantee reliable service.

## ✨ Features
- **Intelligent LLM Router**: Automatically falls back between Groq, OpenAI, and Gemini.
- **RAG Knowledge Base**: Uses `hibernate-vector` to provide the AI with grounded contextual knowledge.
- **Interactive UI**: Drag-and-drop itinerary editing, 3D interactive globes, and Leaflet mapping.
- **Secure Backend**: Stateless JWT authentication and role-based access control.

## 🛠️ Tech Stack
- **Backend:** Java 17+, Spring Boot 3.5, Spring Security (JWT), Spring Data JPA, PostgreSQL / H2.
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, React-Leaflet, React-Globe.gl.
- **AI Integrations:** Native HTTP Client integration with Groq, OpenAI, and Gemini APIs.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Java 17 or higher
- Node.js & npm
- An API key from [Groq](https://console.groq.com/), [OpenAI](https://platform.openai.com/), or [Google AI Studio](https://aistudio.google.com/)

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/AbdulKalamU/Ai-tinerary.git
cd Ai-tinerary

# Configure environment variables
cp .env.example .env.local
# Open .env.local and add your API keys and a JWT secret

# Run the Spring Boot application
./mvnw spring-boot:run
```
*The backend runs on `http://localhost:8080` and uses an in-memory H2 database by default.*

### 2. Frontend Setup
```bash
# Open a new terminal tab
cd frontend-react

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend runs on `http://localhost:5173`.*

## 🤝 Contributing

We welcome contributions from the open-source community! Whether it's a bug fix, new feature, or documentation improvement, your help is appreciated.

### How to Contribute
1. **Fork** the repository.
2. **Clone** your fork locally.
3. **Create a branch** for your feature (`git checkout -b feature/AmazingFeature`).
4. **Make your changes** and test them locally.
5. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
6. **Push** to your branch (`git push origin feature/AmazingFeature`).
7. **Open a Pull Request** against the `main` branch of this repository.

### Development Guidelines
- Ensure your Java code follows standard Spring Boot conventions.
- Run tests (`./mvnw test`) before submitting a PR.
- Ensure your React components use Tailwind CSS for styling and follow the existing design system.

## 📄 License
This project is licensed under the MIT License.
