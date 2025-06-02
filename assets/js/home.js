const apiKey = 'bdd10d2b8f52bc0a5320d5c9d88bd1ff';
const COMMENTS_API = 'http://localhost:3000/comments';

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

const userName = document.getElementById('user-name');
const GEMINI_API_KEY = "AIzaSyAS0uSxL6yeZO5_1oLH3Rzet7RZQIu5mgQ";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const chatHistory = [];

let currentCategory = 'all';
let currentPeriod = 'day';

// Fetch trending movies
document.querySelectorAll('nav li[data-category]').forEach(btn => {
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
  alert('Logged out!');
  window.location.href = '/index.html';
});

// Close modal
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

// Open/Close chatbot
openChatBtn.addEventListener('click', () => {
  chatbot.classList.add('active');
  openChatBtn.style.display = 'none';
});

closeChat.addEventListener('click', () => {
  chatbot.classList.remove('active');
  openChatBtn.style.display = 'flex';
});

// Chat Form Submit
chatForm.addEventListener('submit', async e => {
  e.preventDefault();
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  appendMessage(userMsg, 'user');
  chatInput.value = '';

  const botReply = await generateResponse(userMsg);
  appendMessage(botReply, 'bot');
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Gemini API response
async function generateResponse(userMessage) {
  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();
    const geminiReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\\([^]+)\\*/g, "$1") ||
      "No response";

    chatHistory.push({
      role: "model",
      parts: [{ text: geminiReply }]
    });

    return geminiReply;
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, there was an error.";
  }
}

// Fetch Trending from TMDB
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

  // Always show "Guest" since no localStorage
  if (userName) userName.textContent = 'Guest';
}

// Display movies
function displayTrending(items) {
  card.innerHTML = '';
  if (!items.length) {
    card.innerHTML = `<p style="color:#888; text-align:center;">No results found.</p>`;
    return;
  }

  items.forEach(item => {
    const title = item.title || item.name || 'No title';
    const poster = item.poster_path
      ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Image';

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

// Show movie modal
function showDetail(item) {
  const title = item.title || item.name || 'No title';
  const overview = item.overview || 'No description available.';
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/original${item.poster_path}`
    : 'https://via.placeholder.com/900x600?text=No+Image';

  detailContent.innerHTML = `
    <img src="${poster}" alt="${title}" class="modal-img" />
    <h2>${title}</h2>
    <p>${overview}</p>
    <hr style="margin: 20px 0; border-color: #e50914;" />

    <div id="commentsSection">
      <h3>Comments & Feedback</h3>
      <div id="commentsList" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px; color: #ccc; border: 1px solid #444; padding: 10px; border-radius: 8px;"></div>
      <form id="commentForm">
        <textarea id="commentInput" placeholder="Write your comment here..." rows="3" style="width: 100%; padding: 8px; border-radius: 5px; border: none; resize: vertical;"></textarea>
        <button type="submit" style="margin-top: 10px; padding: 10px 20px; background-color: #e50914; border: none; color: white; border-radius: 5px; cursor: pointer;">Add Comment</button>
      </form>
    </div>
  `;

  loadComments(item.id);

  const commentForm = document.getElementById('commentForm');
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    if (!commentText) return;

    await addComment(item.id, commentText);
    commentInput.value = '';
  });

  detailModal.classList.remove('hidden');
}

// Load comments from JSON Server
async function loadComments(movieId) {
  const commentsList = document.getElementById('commentsList');
  commentsList.innerHTML = '';

  try {
    const res = await fetch(`${COMMENTS_API}?movieId=${movieId}`);
    const comments = await res.json();

    if (comments.length === 0) {
      commentsList.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
      return;
    }

    comments.forEach(c => {
      const p = document.createElement('p');
      p.textContent = c.text;
      p.style.padding = '6px 0';
      p.style.borderBottom = '1px solid #444';
      commentsList.appendChild(p);
    });
  } catch {
    commentsList.innerHTML = '<p style="color:red;">Failed to load comments.</p>';
  }
}

// Add comment to JSON Server
async function addComment(movieId, commentText) {
  try {
    const newComment = { movieId, text: commentText };
    const res = await fetch(COMMENTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment),
    });

    if (!res.ok) throw new Error('Failed to add comment');
    loadComments(movieId);
  } catch {
    alert("Could not add comment. Try again.");
  }
}

// Initial load
fetchTrending();
