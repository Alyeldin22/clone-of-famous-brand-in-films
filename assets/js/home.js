const apiKey = 'bdd10d2b8f52bc0a5320d5c9d88bd1ff';
const COMMENTS_API = 'http://localhost:3000/comments';

// Check if server is running
async function checkServerStatus() {
  try {
    const response = await fetch(COMMENTS_API);
    return response.ok;
  } catch (error) {
    console.warn('Comments server is not running:', error);
    return false;
  }
}

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
let hoveredMovie = null; // لتعقب الفيلم الحالي في الـ hover

// التبديل بين الفئات
document.querySelectorAll('nav li[data-category]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCategory = btn.getAttribute('data-category');
    fetchTrending(currentCategory, currentPeriod);
  });
});

// تغيير الفترة الزمنية
document.getElementById('period').addEventListener('change', e => {
  currentPeriod = e.target.value;
  fetchTrending(currentCategory, currentPeriod);
});

// تسجيل الخروج
document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  alert('Logged out!');
  window.location.href = '/index.html';
});

// إغلاق التفاصيل
closeDetail.addEventListener('click', () => {
  detailModal.classList.add('hidden');
  detailContent.innerHTML = '';
});

// إغلاق المودال عند الضغط خارج المحتوى
window.addEventListener('click', (e) => {
  if (e.target === detailModal) {
    detailModal.classList.add('hidden');
    detailContent.innerHTML = '';
  }
});

// فتح وغلق الشات بوت
openChatBtn.addEventListener('click', () => {
  chatbot.classList.add('active');
  openChatBtn.style.display = 'none';
});
closeChat.addEventListener('click', () => {
  chatbot.classList.remove('active');
  openChatBtn.style.display = 'flex';
});

// ارسال رسالة من المستخدم
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

// جلب الأفلام الشائعة
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

  setUserName();
}

function setUserName() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  userName.textContent = user ? user.fullName : 'Guest';
}

function displayTrending(items) {
  card.innerHTML = '';
  if (!items.length) {
    card.innerHTML = `<p style="color:#888; text-align:center;">No results found.</p>`;
    return;
  }

  items.forEach(item => {
    let title, poster;
    if (item.media_type === 'person' || item.profile_path) {
      title = item.name || 'No name';
      poster = item.profile_path
        ? `https://image.tmdb.org/t/p/w300${item.profile_path}`
        : 'https://via.placeholder.com/300x450?text=No+Image';
    } else {
      title = item.title || item.name || 'No title';
      poster = item.poster_path
        ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
        : 'https://via.placeholder.com/300x450?text=No+Image';
    }

    const div = document.createElement('div');
    div.classList.add('card-item');
    div.innerHTML = `
      <div class="card__img">
        <img src="${poster}" alt="${title}" />
      </div>
      <div class="card__text">
        <h3 class="card__title">${title}</h3>
        <p class="card__description">${(item.overview || item.known_for?.map(k => k.title || k.name).join(', ') || '').slice(0, 100)}...</p>
      </div>
    `;

    div.addEventListener('click', () => {
      showDetail(item);
    });

    div.addEventListener('mouseenter', () => {
      hoveredMovie = { title, poster };
      updateHoverPreview(title, poster);
    });
    div.addEventListener('mouseleave', () => {
      hoveredMovie = null;
      hideHoverPreview();
    });

    card.appendChild(div);
  });
}

function updateHoverPreview(title, imgSrc) {
  const hoverPreview = document.getElementById('hoverPreview');
  const hoverTitle = document.getElementById('hoverTitle');
  const hoverImage = hoverPreview.querySelector('img');

  hoverTitle.textContent = title;
  hoverImage.src = imgSrc;
  hoverPreview.classList.remove('hidden');
}

function hideHoverPreview() {
  const hoverPreview = document.getElementById('hoverPreview');
  hoverPreview.classList.add('hidden');
}

document.getElementById('playButton').addEventListener('click', () => {
  if (hoveredMovie) {
    alert(`Playing: ${hoveredMovie.title}`);
  } else {
    alert('No movie selected!');
  }
});

async function showDetail(item) {
  let title, overview, poster;
  if (item.media_type === 'person' || item.profile_path) {
    title = item.name || 'No name';
    overview = item.biography || (item.known_for?.map(k => k.title || k.name).join(', ') || 'No details available.');
    poster = item.profile_path
      ? `https://image.tmdb.org/t/p/original${item.profile_path}`
      : 'https://via.placeholder.com/900x600?text=No+Image';
  } else {
    title = item.title || item.name || 'No title';
    overview = item.overview || 'No description available.';
    poster = item.poster_path
      ? `https://image.tmdb.org/t/p/original${item.poster_path}`
      : 'https://via.placeholder.com/900x600?text=No+Image';
  }

  detailContent.innerHTML = `
    <img src="${poster}" alt="${title}" class="modal-img" />
    <h2>${title}</h2>
    <p>${overview}</p>
    <hr style="margin: 20px 0; border-color: #e50914;" />
    <div id="videoTrailer" style="margin-bottom: 20px;"></div>
    <div id="commentsSection">
      <h3>Comments & Feedback</h3>
      <div id="commentsList" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px; color: #ccc; border: 1px solid #444; padding: 10px; border-radius: 8px;"></div>
      <form id="commentForm">
        <textarea id="commentInput" placeholder="Write your comment here..." rows="3" style="width: 100%; padding: 8px; border-radius: 5px; border: none; resize: vertical;"></textarea>
        <button type="submit" style="margin-top: 10px; padding: 10px 20px; background-color: #e50914; border: none; color: white; border-radius: 5px; cursor: pointer;">Add Comment</button>
      </form>
    </div>
  `;

  const videos = await fetchMovieVideos(item.id);
  showVideo(videos);

  // Check server status and load comments
  const serverRunning = await checkServerStatus();
  if (serverRunning) {
    loadComments(item.id);
  } else {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '<p style="color:orange;">Comments are offline. Start the server with "npm start" to enable comments.</p>';
  }

  const commentForm = document.getElementById('commentForm');
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    if (!commentText) return;

    const serverRunning = await checkServerStatus();
    if (!serverRunning) {
      alert('Comments server is not running. Please start the server with "npm start" to add comments.');
      return;
    }

    await addComment(item.id, commentText);
    commentInput.value = '';
  });

  detailModal.classList.remove('hidden');
}

async function fetchMovieVideos(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.results;
  } catch {
    return [];
  }
}

function showVideo(videos) {
  const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
  const videoDiv = document.getElementById('videoTrailer');

  if (trailer) {
    const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}`;
    videoDiv.innerHTML = `
      <iframe width="100%" height="315" src="${youtubeUrl}" frameborder="0" allowfullscreen></iframe>
    `;
  } else {
    videoDiv.innerHTML = '<p style="color:#ccc;">No trailer available.</p>';
  }
}

async function loadComments(movieId) {
  const commentsList = document.getElementById('commentsList');
  commentsList.innerHTML = '<p style="color:#888;">Loading comments...</p>';

  try {
    const res = await fetch(`${COMMENTS_API}?movieId=${movieId}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const comments = await res.json();

    if (comments.length === 0) {
      commentsList.innerHTML = '<p style="color:#888;">No comments yet. Be the first to comment!</p>';
      return;
    }

    commentsList.innerHTML = '';
    comments.forEach(c => {
      const commentDiv = document.createElement('div');
      commentDiv.style.padding = '8px 0';
      commentDiv.style.borderBottom = '1px solid #444';
      commentDiv.style.marginBottom = '8px';
      
      const commentText = document.createElement('p');
      commentText.textContent = c.text;
      commentText.style.margin = '0';
      commentText.style.color = '#ccc';
      
      const timestamp = document.createElement('small');
      timestamp.textContent = c.timestamp ? new Date(c.timestamp).toLocaleDateString() : '';
      timestamp.style.color = '#666';
      timestamp.style.fontSize = '0.8em';
      
      commentDiv.appendChild(commentText);
      commentDiv.appendChild(timestamp);
      commentsList.appendChild(commentDiv);
    });
  } catch (error) {
    console.error('Error loading comments:', error);
    commentsList.innerHTML = '<p style="color:red;">Failed to load comments. Make sure the server is running.</p>';
  }
}

async function addComment(movieId, commentText) {
  try {
    const newComment = { 
      movieId, 
      text: commentText,
      timestamp: new Date().toISOString()
    };
    
    const res = await fetch(COMMENTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    // Reload comments to show the new one
    await loadComments(movieId);
    
    // Show success message
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
      commentInput.style.borderColor = '#4CAF50';
      setTimeout(() => {
        commentInput.style.borderColor = '';
      }, 2000);
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    alert("Could not add comment. Make sure the server is running and try again.");
  }
}

fetchTrending();
