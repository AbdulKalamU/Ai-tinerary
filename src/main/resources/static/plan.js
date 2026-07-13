document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected');
    });
  });
  
  const cities = [
    "Amsterdam", "Athens", "Auckland", "Bangkok", "Barcelona",
    "Berlin", "Boston", "Cairo", "Chennai", "Delhi", "Dubai",
    "Istanbul", "London", "Melbourne", "New York", "Paris",
    "Rome", "Singapore", "Sydney", "Tokyo"
  ];
  
  function autocompleteCity(query) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = "";
  
    if (query.length === 0) return;
  
    const filtered = cities.filter(city =>
      city.toLowerCase().startsWith(query.toLowerCase())
    );
  
    filtered.forEach(city => {
      const div = document.createElement("div");
      div.innerText = city;
      div.style.padding = "10px 14px";
      div.style.cursor = "pointer";
      div.style.backgroundColor = "#2c3e50";
      div.style.marginTop = "4px";
      div.style.borderRadius = "6px";
      div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
      div.onclick = () => {
        document.getElementById("destination").value = city;
        suggestionsDiv.innerHTML = "";
      };
      div.onmouseover = () => div.style.backgroundColor = "#4c8df1";
      div.onmouseout = () => div.style.backgroundColor = "#2c3e50";
      suggestionsDiv.appendChild(div);
    });
  }
  
  function openModal() {
    const modal = document.getElementById('travelModal');
    modal.style.display = 'flex';
    modal.style.animation = 'fadeIn 0.4s ease';
    modal.style.backdropFilter = 'blur(10px)';
  }
  
  function closeModal() {
    const modal = document.getElementById('travelModal');
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => modal.style.display = 'none', 300);
  }

  // Handle "Generate AI Plan" button click
document.querySelector('.generate-ai-btn').addEventListener('click', () => {
  const destination = document.getElementById('destination').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  const selectedActivities = Array.from(document.querySelectorAll('.button-group:nth-of-type(1) .option-btn.selected'))
    .map(btn => btn.textContent.trim());

  const travelGroup = Array.from(document.querySelectorAll('.button-group:nth-of-type(2) .option-btn.selected'))
    .map(btn => btn.textContent.trim());

  const travelData = {
    destination,
    startDate,
    endDate,
    activities: selectedActivities,
    group: travelGroup
  };

  localStorage.setItem('travelPlan', JSON.stringify(travelData));
  window.location.href = 'ai.html';
});

document.addEventListener('DOMContentLoaded', () => {
  const travelData = JSON.parse(localStorage.getItem('travelPlan'));

  if (!travelData) {
    alert('No travel data found!');
    return;
  }

  // Send data to backend
  fetch('http://localhost:8080/api/generate-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(travelData)
  })
  .then(response => response.json())
  .then(data => {
    // Fill in the sections with AI-generated content
    document.getElementById('about').innerText = data.about || 'No description available.';
    document.getElementById('weather').innerText = data.weather || 'No weather info.';
    document.getElementById('itinerary').innerText = data.itinerary || 'No itinerary.';
    document.getElementById('activities').innerText = data.activities || 'No activities found.';
    document.getElementById('places').innerText = data.places || 'No places found.';
  })
  .catch(error => {
    console.error('Error fetching AI plan:', error);
    alert('Failed to generate plan. Please try again.');
  });
});
document.addEventListener('DOMContentLoaded', async () => {
  const travelData = JSON.parse(localStorage.getItem('travelPlan'));

  if (!travelData) {
    console.error("No travel plan found in localStorage.");
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/api/ai/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(travelData)
    });

    const data = await response.json();

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";
    const sections = splitIntoSections(aiText);

    displaySections(sections);
  } catch (error) {
    console.error("Error fetching AI plan:", error);
  }
});

function splitIntoSections(text) {
  const sectionRegex = /##\s+(.*?)\n([\s\S]*?)(?=##\s+|$)/g;
  const sections = {};
  let match;

  while ((match = sectionRegex.exec(text)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();
    sections[title] = content;
  }

  return sections;
}

function displaySections(sections) {
  const container = document.getElementById('ai-plan-content');
  container.innerHTML = ''; // Clear previous content

  for (const [title, content] of Object.entries(sections)) {
    const sectionDiv = document.createElement('section');
    sectionDiv.classList.add('ai-section');

    sectionDiv.innerHTML = `
      <h2>${title}</h2>
      <p>${content.replace(/\n/g, '<br>')}</p>
    `;

    container.appendChild(sectionDiv);
  }
}
document.querySelector('.generate-ai-btn').addEventListener('click', () => {
  const destination = document.getElementById('destination').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  const activityButtons = document.querySelectorAll('.button-group:nth-of-type(2) .option-btn.selected');
  const groupButtons = document.querySelectorAll('.button-group:nth-of-type(3) .option-btn.selected');

  const activities = Array.from(activityButtons).map(btn => btn.textContent.trim());
  const groupType = groupButtons.length > 0 ? groupButtons[0].textContent.trim() : "Solo";

  const params = new URLSearchParams({
    destination,
    startDate,
    endDate,
    groupType,
    activities: JSON.stringify(activities)
  });

  window.location.href = `ai.html?${params.toString()}`;
});
