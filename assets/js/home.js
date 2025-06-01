const apiKey = 'bdd10d2b8f52bc0a5320d5c9d88bd1ff'; // مفتاح API صحيح بدون Bearer

const card = document.querySelector('.card');
const detailModal = document.getElementById('detailModal');
const detailContent = document.getElementById('detailContent');
const closeDetail = document.getElementById('closeDetail');

const openChatBtn = document.getElementById('openChatBtn');
const chatbot = document.getElementById('chatbot');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

let currentCategory = 'all';
let currentPeriod = 'day';

document.querySelectorAll('.controls button[data-category]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCategory = btn.getAttribute('data-category');
    fetchTrending(currentCategory, currentPeriod);
  });
});

document.getElementById('period').addEventListener('change', e => {
  currentPeriod = e.target.value;
  fetchTrending(currentCategory, currentPeriod);
});

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('user');
  alert('Logged out!');
  window.location.href = '/index.html'; 
});

closeDetail.addEventListener('click', () => {
  detailModal.classList.add('hidden');
  detailContent.innerHTML = '';
});

window.addEventListener('click', (e) => {
  if (e.target === detailModal) {
    detailModal.classList.add('hidden');
    detailContent.innerHTML = '';
  }
});

// Chatbot toggle
openChatBtn.addEventListener('click', () => {
  chatbot.classList.add('active');
  openChatBtn.style.display = 'none';
});

closeChat.addEventListener('click', () => {
  chatbot.classList.remove('active');
  openChatBtn.style.display = 'flex';
});

// Chatbot messages (بسيط جدا)
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  appendMessage(userMsg, 'user');
  chatInput.value = '';

  // Simple bot response
  setTimeout(() => {
    let botReply = generateBotReply(userMsg);
    appendMessage(botReply, 'bot');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 600);
});

function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateBotReply(msg) {
  msg = msg.toLowerCase();
  if (msg.includes('hello') || msg.includes('hi')) return 'Hello! How can I assist you with movies or TV shows?';
  if (msg.includes('recommend')) return 'Sure! Try "Stranger Things" or "The Witcher".';
  if (msg.includes('bye')) return 'Goodbye! Have a great day!';
  return "Sorry, I didn't understand that. Try asking for recommendations or trending shows.";
}

// Fetch trending
async function fetchTrending(category = 'all', period = 'day') {
  card.innerHTML = `<p style="color:#888; text-align:center; font-size:1.2rem;">Loading...</p>`;

  let url = '';
  if (category === 'all') {
    url = `https://api.themoviedb.org/3/trending/all/${period}?api_key=${apiKey}`;
  } else {
    url = `https://api.themoviedb.org/3/trending/${category}/${period}?api_key=${apiKey}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    displayTrending(data.results);
  } catch (error) {
    card.innerHTML = `<p style="color:red; text-align:center;">Failed to load data.</p>`;
  }
}

// عرض البطاقات
function displayTrending(items) {
  card.innerHTML = '';
  if (!items.length) {
    card.innerHTML = `<p style="color:#888; text-align:center;">No results found.</p>`;
    return;
  }
  items.forEach(item => {
    const title = item.title || item.name || 'No title';
    const poster = item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image';

    const div = document.createElement('div');
    div.classList.add('card-item');
    div.innerHTML = `
      <div class="card__img">
        <img src="${poster}" alt="${title}" />
      </div>
      <div class="card__text">
        <h3 class="card__title">${title}</h3>
        <p class="card__description">${(item.overview || '').slice(0, 100)}...</p>
      </div>
    `;

    div.addEventListener('click', () => {
      showDetail(item);
    });

    card.appendChild(div);
  });
}

// تفاصيل الفيلم في المودال
function showDetail(item) {
  const title = item.title || item.name || 'No title';
  const overview = item.overview || 'No description available.';
  const poster = item.poster_path ? `https://image.tmdb.org/t/p/original${item.poster_path}` : 'https://via.placeholder.com/900x600?text=No+Image';

  detailContent.innerHTML = `
    <img src="${poster}" alt="${title}" />
    <h2>${title}</h2>
    <p>${overview}</p>
  `;
  detailModal.classList.remove('hidden');
}

// البداية
fetchTrending();
