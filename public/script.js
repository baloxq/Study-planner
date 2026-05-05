const defaultProfile = {
  firstName: 'Olha',
  lastName: 'Balakina',
  email: 'olha.balakina@student.vdu.lt',
  level: 'Year 2, Semester 2',
  program: 'Internet Technology',
  university: 'Vytautas Magnus University'
};

const initialTasks = [
  {title:'Complete Math Assignment', subject:'Mathematics', date:'2026-04-18', priority:'high', type:'Homework', done:false},
  {title:'Biology Chapter Summary', subject:'Biology', date:'2026-04-19', priority:'medium', type:'Lecture Review', done:false},
  {title:'History Essay Draft', subject:'History', date:'2026-04-21', priority:'high', type:'Essay', done:false},
  {title:'Physics Lab Upload', subject:'Physics', date:'2026-04-23', priority:'low', type:'Lab', done:true}
];

let tasks = JSON.parse(localStorage.getItem('studyPlannerTasks') || 'null') || initialTasks;
let profile = JSON.parse(localStorage.getItem('studyPlannerProfile') || 'null') || defaultProfile;
let selectedImage = 0;

function saveTasks(){ localStorage.setItem('studyPlannerTasks', JSON.stringify(tasks)); }
function saveProfile(){ localStorage.setItem('studyPlannerProfile', JSON.stringify(profile)); }

function applySavedPreferences(){
  const darkMode = localStorage.getItem('studyPlannerDark') === 'true';
  const accent = localStorage.getItem('studyPlannerAccent') || '#4f46e5';
  const baseSize = localStorage.getItem('studyPlannerFontSize') || '16';
  document.body.classList.toggle('dark', darkMode);
  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--base-size', baseSize + 'px');
  document.querySelectorAll('.dark-toggle').forEach(el => el.checked = darkMode);
  document.querySelectorAll('.accent-select').forEach(el => el.value = accent);
  document.querySelectorAll('.font-range').forEach(el => el.value = baseSize);
  updateFontValue(baseSize);
}

function initProfileCards(){
  document.querySelectorAll('[data-profile]').forEach(holder => {
    holder.innerHTML = `
      <div class="profile-top">
        <div class="avatar">${profile.firstName[0] || 'S'}${profile.lastName[0] || ''}</div>
        <div>
          <h3>${profile.firstName} ${profile.lastName}</h3>
          <div class="muted">${profile.program}</div>
        </div>
      </div>
      <div class="profile-view">
        <dl>
          <dt>Email</dt><dd>${profile.email}</dd>
          <dt>Study level</dt><dd>${profile.level}</dd>
          <dt>Study program</dt><dd>${profile.program}</dd>
          <dt>University</dt><dd>${profile.university}</dd>
        </dl>
      </div>
      <div class="profile-form ${holder.dataset.editing === 'true' ? 'active' : ''}">
        <div class="row-2">
          <input name="firstName" value="${profile.firstName}" placeholder="Name">
          <input name="lastName" value="${profile.lastName}" placeholder="Surname">
        </div>
        <input name="email" value="${profile.email}" placeholder="Email">
        <input name="level" value="${profile.level}" placeholder="Year and semester">
        <input name="program" value="${profile.program}" placeholder="Study program">
        <input name="university" value="${profile.university}" placeholder="University">
        <div class="form-actions">
          <button class="btn" type="button" onclick="saveProfileFromCard(this)">Save profile</button>
          <button class="btn secondary" type="button" onclick="toggleProfileEdit(this)">Cancel</button>
        </div>
      </div>
      <button class="btn secondary full" type="button" onclick="toggleProfileEdit(this)">${holder.dataset.editing === 'true' ? 'Close editor' : 'Edit profile'}</button>
    `;
  });
}

function toggleProfileEdit(button){
  const card = button.closest('[data-profile]') || button.closest('.profile-card');
  const form = card.querySelector('.profile-form');
  const editBtn = card.querySelector('.btn.secondary.full');
  form.classList.toggle('active');
  editBtn.textContent = form.classList.contains('active') ? 'Close editor' : 'Edit profile';
}

function saveProfileFromCard(button){
  const card = button.closest('[data-profile]') || button.closest('.profile-card');
  ['firstName','lastName','email','level','program','university'].forEach(key => {
    profile[key] = card.querySelector(`[name="${key}"]`).value.trim();
  });
  saveProfile();
  initProfileCards();
  bindPreferenceControls();
}

function bindPreferenceControls(){
  document.querySelectorAll('.dark-toggle').forEach(toggle => {
    toggle.onchange = () => {
      document.body.classList.toggle('dark', toggle.checked);
      localStorage.setItem('studyPlannerDark', String(toggle.checked));
      document.querySelectorAll('.dark-toggle').forEach(el => el.checked = toggle.checked);
    };
  });
  document.querySelectorAll('.accent-select').forEach(select => {
    select.onchange = () => {
      document.documentElement.style.setProperty('--accent', select.value);
      localStorage.setItem('studyPlannerAccent', select.value);
      document.querySelectorAll('.accent-select').forEach(el => el.value = select.value);
    };
  });
  document.querySelectorAll('.font-range').forEach(range => {
    range.oninput = () => {
      document.documentElement.style.setProperty('--base-size', range.value + 'px');
      localStorage.setItem('studyPlannerFontSize', range.value);
      document.querySelectorAll('.font-range').forEach(el => el.value = range.value);
      updateFontValue(range.value);
    };
  });
}

function updateFontValue(value){
  document.querySelectorAll('.range-value').forEach(el => el.textContent = value + 'px');
}

function renderTasks(listEl){
  if(!listEl) return;
  listEl.innerHTML = '';
  const filter = listEl.dataset.filter || 'all';
  const current = tasks.filter(t => {
    if(filter === 'done') return t.done;
    if(filter === 'todo') return !t.done;
    return true;
  });

  current.forEach((task, index) => listEl.appendChild(taskRow(task, index)));
  if(!current.length){
    listEl.innerHTML = '<div class="note">No tasks match this view yet. Add a new task to demonstrate the MVP workflow.</div>';
  }
  updateStats();
}

function taskRow(task, index){
  const row = document.createElement('article');
  row.className = 'task';
  row.innerHTML = `
    <div class="left">
      <input type="checkbox" ${task.done ? 'checked' : ''} aria-label="mark completed">
      <div>
        <div class="title">${task.title}</div>
        <div class="meta">${task.subject} • ${task.type} • Due ${formatDate(task.date)}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag ${task.priority}">${capitalize(task.priority)}</span>
          <span class="tag ${task.done ? 'done' : 'low'}">${task.done ? 'Completed' : 'Active'}</span>
        </div>
      </div>
    </div>
    <div class="task-actions">
      <button class="icon-btn" title="duplicate" aria-label="duplicate task">📄</button>
      <button class="icon-btn" title="delete" aria-label="delete task">🗑️</button>
    </div>
  `;
  row.querySelector('input').onchange = (e) => {
    task.done = e.target.checked;
    saveTasks();
    refreshAll();
  };
  row.querySelectorAll('.icon-btn')[0].onclick = () => {
    tasks.unshift({...task, title: task.title + ' (copy)', done:false});
    saveTasks();
    refreshAll();
  };
  row.querySelectorAll('.icon-btn')[1].onclick = () => {
    tasks.splice(index, 1);
    saveTasks();
    refreshAll();
  };
  return row;
}

function formatDate(dateStr){
  return new Date(dateStr).toLocaleDateString('en-GB', {day:'2-digit', month:'short'});
}
function capitalize(word){ return word.charAt(0).toUpperCase() + word.slice(1); }

function toggleForm(){
  const box = document.getElementById('taskFormWrap');
  if(box) box.classList.toggle('hidden');
}

function addTask(e){
  e.preventDefault();
  const title = document.getElementById('f_title').value.trim();
  const subject = document.getElementById('f_subject').value.trim();
  const date = document.getElementById('f_date').value;
  const priority = document.getElementById('f_priority').value;
  const type = document.getElementById('f_type').value;
  if(!title || !subject || !date) return;
  tasks.unshift({title, subject, date, priority, type, done:false});
  saveTasks();
  e.target.reset();
  toggleForm();
  refreshAll();
}

function updateStats(){
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const active = tasks.filter(t => !t.done).length;
  const high = tasks.filter(t => t.priority === 'high').length;
  document.querySelectorAll('[data-stat="total"]').forEach(el => el.textContent = total);
  document.querySelectorAll('[data-stat="done"]').forEach(el => el.textContent = done);
  document.querySelectorAll('[data-stat="active"]').forEach(el => el.textContent = active);
  document.querySelectorAll('[data-stat="high"]').forEach(el => el.textContent = high);
}

function renderCalendar(){
  const grid = document.getElementById('calGrid');
  if(!grid) return;
  grid.innerHTML = '';
  const days = 30;
  for(let i = 1; i <= days; i++){
    const day = document.createElement('div');
    day.className = 'day';
    day.innerHTML = `<div class="num">${i}</div>`;
    tasks.forEach(task => {
      const d = new Date(task.date).getDate();
      if(d === i){
        const event = document.createElement('div');
        event.className = 'event ' + task.priority;
        event.textContent = task.title;
        day.appendChild(event);
      }
    });
    grid.appendChild(day);
  }
}

function showPreviewMessage(type){
  const box = document.getElementById('previewMessage');
  if(!box) return;
  const messages = {
    dashboard: 'The dashboard centralizes the main MVP actions: overview, add task, monitor deadlines, and continue your daily planning.',
    calendar: 'The calendar view helps the student quickly understand workload distribution and avoid deadline collisions.',
    profile: 'The profile card keeps student identity and study context visible, and it can be edited instantly with no page reload.',
    analytics: 'Progress visuals make the MVP feel real by showing completion rate, priority load, and weekly study trends.',
    tasks: 'The task board demonstrates the core planning loop: create, review, prioritize, complete, and update.'
  };
  box.textContent = messages[type] || messages.dashboard;
  document.querySelectorAll('.visual-card').forEach(card => card.classList.toggle('active', card.dataset.visual === type));
}

function cycleGreeting(){
  const target = document.getElementById('dynamicGreeting');
  if(!target) return;
  const messages = [
    'Stay consistent and finish one important task first.',
    'Use the planner to break large deadlines into smaller actions.',
    'A simple weekly overview can prevent last-minute stress.'
  ];
  let index = Number(target.dataset.index || 0);
  index = (index + 1) % messages.length;
  target.dataset.index = index;
  target.textContent = messages[index];
}

function filterTasks(mode){
  document.querySelectorAll('#taskList,[data-role="tasks-list"]').forEach(list => {
    list.dataset.filter = mode;
    renderTasks(list);
  });
}

function refreshAll(){
  document.querySelectorAll('#taskList,[data-role="tasks-list"]').forEach(renderTasks);
  renderCalendar();
}

document.addEventListener('DOMContentLoaded', () => {
  applySavedPreferences();
  initProfileCards();
  bindPreferenceControls();
  showPreviewMessage('dashboard');
  refreshAll();
});

/* ============================================================
   API #1 – STATIC HTML API: ZenQuotes (via allorigins proxy)
   Loads a random motivational quote from a 3rd-party server.
   No user input required – fires automatically on dashboard load.
   ============================================================ */
async function loadQuote() {
  const box = document.getElementById('quoteBox');
  if (!box) return;
  box.innerHTML = '<span class="quote-loader">Loading quote…</span>';
  try {
    // ZenQuotes doesn't allow direct browser requests (CORS), so we use
    // the free allorigins.win proxy to relay the response.
    const url = 'https://api.allorigins.win/raw?url=' +
      encodeURIComponent('https://zenquotes.io/api/random');
    const res = await fetch(url);
    const data = await res.json(); // returns [{ q, a }]
    const { q, a } = data[0];
    box.innerHTML = `
      <div class="quote-text">"${q}"</div>
      <div class="quote-author">— ${a}</div>
    `;
  } catch (err) {
    box.innerHTML = '<span class="quote-loader">Could not load quote. Check your connection.</span>';
  }
}

/* ============================================================
   API #2 – DYNAMIC HTML + JS API: Open-Meteo weather
   User enters a city name → JS geocodes it → fetches live weather.
   Entirely driven by user input; different city = different response.
   ============================================================ */
const WMO_CODES = {
  0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
  45:'Foggy',48:'Icy fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',
  61:'Slight rain',63:'Moderate rain',65:'Heavy rain',
  71:'Slight snow',73:'Moderate snow',75:'Heavy snow',
  80:'Slight showers',81:'Moderate showers',82:'Violent showers',
  95:'Thunderstorm',96:'Thunderstorm + hail',99:'Thunderstorm + heavy hail'
};

function weatherIcon(code) {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2 || code === 3) return '⛅';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌫️';
}

async function loadWeather() {
  const cityInput = document.getElementById('weatherCity');
  const box = document.getElementById('weatherBox');
  if (!box || !cityInput) return;
  const city = cityInput.value.trim() || 'Kaunas';
  box.innerHTML = '<span class="quote-loader">Fetching weather…</span>';
  try {
    // Step 1 – geocode city name to lat/lon using Open-Meteo Geocoding API
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();
    if (!geoData.results || !geoData.results.length) {
      box.innerHTML = '<span class="quote-loader">City not found. Try another name.</span>';
      return;
    }
    const { latitude, longitude, name, country } = geoData.results[0];

    // Step 2 – fetch current weather for those coordinates
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current_weather=true&hourly=relative_humidity_2m,wind_speed_10m&timezone=auto&forecast_days=1`
    );
    const weatherData = await weatherRes.json();
    const cw = weatherData.current_weather;
    const humidity = weatherData.hourly?.relative_humidity_2m?.[0] ?? '—';
    const desc = WMO_CODES[cw.weathercode] || 'Unknown';
    const icon = weatherIcon(cw.weathercode);

    box.innerHTML = `
      <div class="weather-main">
        <div style="font-size:2.8rem">${icon}</div>
        <div>
          <div class="weather-city">${name}, ${country}</div>
          <div class="weather-temp">${cw.temperature}°C</div>
          <div class="weather-desc">${desc}</div>
        </div>
      </div>
      <div class="weather-details">
        <div class="weather-detail"><span>Wind</span>${cw.windspeed} km/h</div>
        <div class="weather-detail"><span>Humidity</span>${humidity}%</div>
        <div class="weather-detail"><span>Direction</span>${cw.winddirection}°</div>
      </div>
    `;
  } catch (err) {
    box.innerHTML = '<span class="quote-loader">Weather unavailable. Check connection.</span>';
  }
}

/* ============================================================
   API #3 – DATABASE API: Wikipedia → SQLite resource library
   User searches a topic → results from Wikipedia REST API →
   User clicks Save → JS POSTs to backend → saved in SQLite DB.
   On page load, saved resources are loaded from the database.
   ============================================================ */

// Retrieve JWT token stored after login
function getToken() {
  return localStorage.getItem('studyPlannerToken') || '';
}

async function searchResources() {
  const input = document.getElementById('resourceTopic');
  const resultsSection = document.getElementById('resourceResults');
  const listEl = document.getElementById('resourceList');
  if (!input || !listEl) return;

  const topic = input.value.trim();
  if (!topic) return;

  listEl.innerHTML = '<div class="note">Searching Wikipedia…</div>';
  if (resultsSection) resultsSection.style.display = 'block';

  try {
    // Wikipedia REST API – open, no API key required
    // We search up to 5 related articles using the search/title endpoint
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&srlimit=5&format=json&origin=*`
    );
    const searchData = await searchRes.json();
    const pages = searchData.query?.search || [];

    if (!pages.length) {
      listEl.innerHTML = '<div class="note">No results found. Try a different topic.</div>';
      return;
    }

    // Fetch summary for each result
    const summaries = await Promise.all(pages.map(async (page) => {
      try {
        const r = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title)}`
        );
        return await r.json();
      } catch { return null; }
    }));

    listEl.innerHTML = '';
    summaries.filter(Boolean).forEach(article => {
      const card = document.createElement('div');
      card.className = 'resource-card';
      card.innerHTML = `
        <h5>${article.title}</h5>
        <p>${article.extract || 'No summary available.'}</p>
        <a href="${article.content_urls?.desktop?.page || '#'}" target="_blank" rel="noopener">Read on Wikipedia ↗</a>
        <div class="rc-actions">
          <button class="btn" type="button" onclick="saveResource(this, '${escapeAttr(topic)}', '${escapeAttr(article.title)}', '${escapeAttr(article.extract || '')}', '${escapeAttr(article.content_urls?.desktop?.page || '')}')">💾 Save to library</button>
        </div>
      `;
      listEl.appendChild(card);
    });
  } catch (err) {
    listEl.innerHTML = '<div class="note">Search failed. Check your connection.</div>';
  }
}

function escapeAttr(str) {
  return (str || '').replace(/'/g, "\\'").replace(/\n/g, ' ').substring(0, 300);
}

async function saveResource(btn, topic, title, summary, url) {
  btn.disabled = true;
  btn.textContent = 'Saving…';
  try {
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getToken()
      },
      body: JSON.stringify({ topic, title, summary, url })
    });
    const data = await res.json();
    if (data.id) {
      btn.textContent = '✅ Saved!';
      loadSavedResources(); // Refresh saved list from DB
    } else {
      btn.textContent = '⚠️ Login to save';
      btn.disabled = false;
    }
  } catch {
    btn.textContent = '❌ Error';
    btn.disabled = false;
  }
}

async function loadSavedResources() {
  const container = document.getElementById('savedResources');
  const countEl = document.getElementById('savedCount');
  if (!container) return;

  try {
    const res = await fetch('/api/resources', {
      headers: { 'Authorization': getToken() }
    });
    const resources = await res.json();

    if (!resources.length || resources.error) {
      container.innerHTML = '<div class="note">No saved resources yet. Search above and click Save to add articles to your library.</div>';
      if (countEl) countEl.textContent = '';
      return;
    }

    if (countEl) countEl.textContent = `(${resources.length} saved)`;
    container.innerHTML = '';
    resources.forEach(r => {
      const card = document.createElement('div');
      card.className = 'resource-card';
      card.innerHTML = `
        <h5>${r.title}</h5>
        <p>${r.summary}</p>
        <a href="${r.url}" target="_blank" rel="noopener">Read on Wikipedia ↗</a>
        <div class="saved-at">Topic: <strong>${r.topic}</strong> • Saved: ${new Date(r.saved_at).toLocaleDateString('en-GB')}</div>
        <div class="rc-actions">
          <button class="btn secondary" type="button" onclick="deleteResource(this, ${r.id})">🗑️ Remove</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch {
    container.innerHTML = '<div class="note">Could not load saved resources. Make sure the server is running.</div>';
  }
}

async function deleteResource(btn, id) {
  btn.disabled = true;
  btn.textContent = 'Removing…';
  try {
    await fetch(`/api/resources/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': getToken() }
    });
    loadSavedResources();
  } catch {
    btn.disabled = false;
    btn.textContent = '🗑️ Remove';
  }
}

/* ============================================================
   Extend DOMContentLoaded to trigger API loads on correct pages
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // API #1: auto-load quote on dashboard
  if (document.getElementById('quoteBox')) loadQuote();
  // API #2: auto-load weather for Kaunas on dashboard
  if (document.getElementById('weatherBox')) loadWeather();
  // API #3: load saved resources on subjects page
  if (document.getElementById('savedResources')) loadSavedResources();

  // Allow Enter key in resource search
  const topicInput = document.getElementById('resourceTopic');
  if (topicInput) {
    topicInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') searchResources();
    });
  }
  // Allow Enter key in weather search
  const weatherInput = document.getElementById('weatherCity');
  if (weatherInput) {
    weatherInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') loadWeather();
    });
  }
});
