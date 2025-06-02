// ========== SIGN UP ========== //
const signupForm = document.querySelector(".signup-form");

if (signupForm && window.location.pathname.includes("index.html")) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = signupForm.firstName.value.trim();
    const lastName = signupForm.lastName.value.trim();
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value;
    const confirmPassword = signupForm.confirmPassword.value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const user = {
      fullName: `${firstName} ${lastName}`,
      email,
      password,
    };

    // Get existing users
    const users = JSON.parse(localStorage.getItem("netflixUsers")) || [];

    // Check if email already exists
    const exists = users.some((u) => u.email === email);
    if (exists) {
      alert("This email is already registered.");
      return;
    }
    setIntoLocalStorageHandel("currentUser",user)
    // Add new user and save
    users.push(user);
    localStorage.setItem("netflixUsers", JSON.stringify(users));

    alert("Sign up successful! Please sign in.");
    window.location.href = "signin.html";
  });
}

// ========== SIGN IN ========== //
if (signupForm && window.location.pathname.includes("signin.html")) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = signupForm.email.value.trim();
    const password = signupForm.password.value;

    const users = JSON.parse(localStorage.getItem("netflixUsers")) || [];

    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      alert(`Welcome back, ${user.fullName}!`);
      // Redirect to home.html after sign in
      window.location.href = "home.html";
    } else {
      alert("Invalid email or password.");
    }
  });
}

// ========== MOVIES FETCHING (HOME PAGE) ========== //
function getMovies(key = "movie", filter = "day") {
  fetch(`https://api.themoviedb.org/3/trending/${key}/${filter}?language=en-US`, {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZGQxMGQyYjhmNTJiYzBhNTMyMGQ1YzlkODhiZDFmZiIsIm5iZiI6MTU5Mjc1NTkwMS44MjgsInN1YiI6IjVlZWY4NmJkZWQyYWMyMDAzNTlkNGM4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NT77KLEZLjsgTMnyjJQBWADPa_t_7ydLLbvEABTxbwM"
    }
  })
    .then((res) => {
      if (!res.ok) throw new Error("Network response error");
      return res.json();
    })
    .then((data) => {
      const movies = data.results;
      const slider = document.querySelector(".trending__slider");
      if (!slider) return;

      slider.innerHTML = "";

      movies.forEach((movie) => {
        const img = document.createElement("img");
        img.src = `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
        img.alt = movie.title || movie.name || "Trending";
        img.classList.add("trending__item-img");

        const itemDiv = document.createElement("div");
        itemDiv.classList.add("trending__item");
        itemDiv.appendChild(img);

        slider.appendChild(itemDiv);
      });
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

// ========== SLIDER CONTROL ========== //
window.onload = () => {
  getMovies("movie", "day");

  const slider = document.querySelector(".trending__slider");
  const btnLeft = document.querySelector(".slider-btn.left");
  const btnRight = document.querySelector(".slider-btn.right");

  if (!slider || !btnLeft || !btnRight) return;

  const itemWidth = 180;
  const gap = 15;
  const scrollStep = itemWidth + gap;

  let scrollAmount = 0;

  btnRight.addEventListener("click", () => {
    scrollAmount += scrollStep;
    if (scrollAmount > slider.scrollWidth - slider.clientWidth) {
      scrollAmount = slider.scrollWidth - slider.clientWidth;
    }
    slider.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
  });

  btnLeft.addEventListener("click", () => {
    scrollAmount -= scrollStep;
    if (scrollAmount < 0) {
      scrollAmount = 0;
    }
    slider.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
  });
};

function setIntoLocalStorageHandel(key,value){
  localStorage.setItem(key , JSON.stringify(value))
}
