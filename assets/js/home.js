const storedUser = JSON.parse(localStorage.getItem("user")) || {
  name: "User",
  email: "",
  profilePic: "",
};
const greetingEl = document.getElementById("greeting");
const profilePicEl = document.getElementById("profile-pic");
const profileUploadInput = document.getElementById("profile-upload");
const logoutBtn = document.getElementById("logout-btn");
const searchInput = document.getElementById("search-input");

const slider = document.getElementById("slider");
const movieDetails = document.getElementById("movie-details");
const detailTitle = document.getElementById("detail-title");
const detailImg = document.getElementById("detail-img");
const detailDesc = document.getElementById("detail-desc");
const closeDetailsBtn = document.getElementById("close-details");

const chatbotMessages = document.getElementById("chatbot-messages");
const chatbotInput = document.getElementById("chatbot-input");

function updateUserUI() {
  greetingEl.textContent = `Hello, ${storedUser.name.split(" ")[0]}`;
  if (storedUser.profilePic) {
    profilePicEl.src = storedUser.profilePic;
  } else {
    profilePicEl.src = "https://via.placeholder.com/40?text=U";
  }
}
updateUserUI();


profilePicEl.addEventListener("click", () => {
  profileUploadInput.click();
});

profileUploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      storedUser.profilePic = evt.target.result;
      localStorage.setItem("user", JSON.stringify(storedUser));
      updateUserUI();
    };
    reader.readAsDataURL(file);
  }
});


logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "signin.html"; 
});


let moviesList = [];
let filteredMovies = []; 

function getMovies(key = "movie", filter = "day") {
  fetch(`https://api.themoviedb.org/3/trending/${key}/${filter}?language=en-US`, {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZGQxMGQyYjhmNTJiYzBhNTMyMGQ1YzlkODhiZDFmZiIsIm5iZiI6MTU5Mjc1NTkwMS44MjgsInN1YiI6IjVlZWY4NmJkZWQyYWMyMDAzNTlkNGM4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NT77KLEZLjsgTMnyjJQBWADPa_t_7ydLLbvEABTxbwM",
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Network response error");
      return res.json();
    })
    .then((data) => {
      moviesList = data.results;
      filteredMovies = moviesList; 
      renderSlider(filteredMovies);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function renderSlider(movies) {
  slider.innerHTML = "";
  movies.forEach((movie) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("movie-card");

    const img = document.createElement("img");
    img.src = movie.poster_path
      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
      : "fallback-image.jpg";
    img.alt = movie.title || movie.name;

    itemDiv.appendChild(img);

    itemDiv.addEventListener("click", () => {
      showMovieDetails(movie);
    });

    slider.appendChild(itemDiv);
  });
}

function showMovieDetails(movie) {
  detailTitle.textContent = movie.title || movie.name;
  detailDesc.textContent = movie.overview || "No description available.";
  detailImg.src = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "fallback-image.jpg";

  movieDetails.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

closeDetailsBtn.addEventListener("click", () => {
  movieDetails.hidden = true;
});

const btnLeft = document.querySelector(".slider-btn.left");
const btnRight = document.querySelector(".slider-btn.right");

btnLeft.addEventListener("click", () => {
  slider.scrollBy({ left: -300, behavior: "smooth" });
});
btnRight.addEventListener("click", () => {
  slider.scrollBy({ left: 300, behavior: "smooth" });
});

// البحث
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query === "") {
    filteredMovies = moviesList;
  } else {
    filteredMovies = moviesList.filter((movie) => {
      const title = (movie.title || movie.name || "").toLowerCase();
      return title.includes(query);
    });
  }
  renderSlider(filteredMovies);
});

// --- شات بوت بسيط ---

const botReplies = {
  hello: "Hello! How can I help you today?",
  hi: "Hi there! What can I do for you?",
  help: "You can search for movies, click on a movie to see details, or ask me questions.",
  bye: "Goodbye! Have a nice day!",
};

function botResponse(message) {
  message = message.toLowerCase();

  for (const key in botReplies) {
    if (message.includes(key)) {
      return botReplies[key];
    }
  }
  return "Sorry, I didn't understand that. Try asking about movies.";
}

chatbotInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && chatbotInput.value.trim() !== "") {
    const userMsg = chatbotInput.value.trim();
    addChatMessage(userMsg, "user");
    chatbotInput.value = "";

    setTimeout(() => {
      const reply = botResponse(userMsg);
      addChatMessage(reply, "bot");
    }, 700);
  }
});

function addChatMessage(msg, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.textContent = msg;
  msgDiv.classList.add(sender);
  chatbotMessages.appendChild(msgDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

getMovies();