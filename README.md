# 🌍 Ai-tinerary: Dynamic AI Travel Orchestrator

A full-stack web application that leverages Google's **Gemini AI API** to generate personalized, structured travel itineraries. Designed with a focus on robust API communication, prompt engineering, and dynamic UI rendering.

## 📸 Application Showcase

**1. Home Screen**
<img width="1440" height="900" alt="Home Screen" src="https://github.com/user-attachments/assets/fa740d38-5dc9-4a6f-aef7-136678541263" />

**2. Login Screen**
<img width="1440" height="900" alt="Login Screen" src="https://github.com/user-attachments/assets/15f36702-8855-4d08-9aaf-f3daf3a07d74" />

**3. Dynamic Input Dashboard**
<img width="1440" height="900" alt="Prompt Screen" src="https://github.com/user-attachments/assets/075cdc6e-c3d7-43c6-87b3-e339c779d562" />

## 🚀 Features
* **AI-Powered Itineraries:** Generates comprehensive day-by-day travel plans using the Gemini AI model based on user constraints.
* **Structured Data Parsing:** Utilizes strict prompt engineering to force the LLM to return standardized JSON payloads instead of unstructured text.
* **Dynamic Dashboard:** A custom asynchronous JavaScript engine deserializes the API response and dynamically injects the data into a responsive Tailwind CSS frontend.
* **Spatial Context:** Integrates the Google Maps Embed API to provide real-time location views based on extracted destination entities.
* **Defensive Error Handling:** Implements graceful UI degradation to handle API rate-limiting (HTTP 429 Quota Exhaustion) and high-latency generation without crashing the application.

## 🛠️ Tech Stack
* **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript (Fetch API, DOM Manipulation)
* **Backend:** Java, Spring Boot, Spring Web
* **Database:** MySQL
* **External APIs:** Google Gemini AI API, Google Maps Embed API

## 🧠 Technical Challenges Solved
1. **Unstructured AI Outputs:** Initially, the LLM returned raw markdown paragraphs. I engineered the system prompt to enforce a strict JSON schema, allowing the backend to serve predictable data to the frontend for seamless DOM population.
2. **API Quota Management:** Encountered and mitigated HTTP 429 (Resource Exhausted) errors during high-frequency testing. Implemented `try-catch` blocks and asynchronous state management (loading spinners) to ensure a smooth user experience even when the API rate limit is reached.

## ⚙️ Local Setup & Installation

### Prerequisites
* Java 17+
* Maven
* MySQL Server
* Google Gemini API Key

### Backend Setup (Spring Boot)
1. Clone the repository:
   ```bash
   git clone [https://github.com/AbdulKalamU/Ai-tinerary.git](https://github.com/AbdulKalamU/Ai-tinerary.git)
Navigate to the backend directory and configure your application.properties file:

Properties
spring.datasource.url=jdbc:mysql://localhost:3306/travel_db
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Add your Gemini API Key
gemini.api.key=YOUR_GEMINI_API_KEY
Run the Spring Boot application:

Bash
mvn spring-boot:run
Frontend Setup
Open the ai.html file in any modern web browser.

Ensure the Spring Boot server is running on localhost:8080 to allow the JavaScript Fetch API to successfully communicate with the backend endpoints.

Built by Abdul Kalam U


### Push the Update
Run your usual three commands in the terminal to ship this change:
```bash
git add README.md
git commit -m "docs: Updated README to display full-width application showcase images"
git push origin main
