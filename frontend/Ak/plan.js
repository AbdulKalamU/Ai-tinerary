document.addEventListener('DOMContentLoaded', () => {
	updatePlanUI();
});

async function updatePlanUI() {
	const params = new URLSearchParams(window.location.search);
	const destination = params.get('destination') || '';

	try {
		const response = await fetch('http://localhost:8080/api/ai/generate-plan', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ destination })
		});
		const data = await response.json();
		let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
		rawText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
		const plan = JSON.parse(rawText);

		document.getElementById('about-box').innerText = plan.about || '';
		document.getElementById('weather-box').innerText = plan.weather || '';

		// Activities
		const activitiesBox = document.getElementById('activities-box');
		if (Array.isArray(plan.activities)) {
			activitiesBox.innerHTML = `<ul>${plan.activities.map(item => `<li>${item}</li>`).join('')}</ul>`;
		} else {
			activitiesBox.innerHTML = '';
		}

		// Places
		const placesBox = document.getElementById('places-box');
		if (Array.isArray(plan.places)) {
			placesBox.innerHTML = `<ul>${plan.places.map(item => `<li>${item}</li>`).join('')}</ul>`;
		} else {
			placesBox.innerHTML = '';
		}

		// Itinerary
		const itineraryBox = document.getElementById('itinerary-box');
		if (Array.isArray(plan.itinerary)) {
			itineraryBox.innerHTML = `<ul>${plan.itinerary.map(item => `<li>${item}</li>`).join('')}</ul>`;
		} else {
			itineraryBox.innerHTML = '';
		}

		// Map
		const mapIframe = document.getElementById('map-iframe');
		if (mapIframe && destination) {
			mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(destination)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
		}
	} catch (error) {
		document.getElementById('about-box').innerText = 'Unable to load plan.';
		document.getElementById('weather-box').innerText = 'Unable to load plan.';
		document.getElementById('activities-box').innerHTML = 'Unable to load plan.';
		document.getElementById('places-box').innerHTML = 'Unable to load plan.';
		const itineraryBox = document.getElementById('itinerary-box');
		if (itineraryBox) itineraryBox.innerHTML = 'Unable to load plan.';
		console.error('Error loading AI plan:', error);
	}
}
