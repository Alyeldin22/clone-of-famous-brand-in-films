function getMovies(key = "movie", filter = "day") {
  fetch(`https://api.themoviedb.org/3/trending/${key}/${filter}?language=en-US`, {
    headers: {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZGQxMGQyYjhmNTJiYzBhNTMyMGQ1YzlkODhiZDFmZiIsIm5iZiI6MTU5Mjc1NTkwMS44MjgsInN1YiI6IjVlZWY4NmJkZWQyYWMyMDAzNTlkNGM4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NT77KLEZLjsgTMnyjJQBWADPa_t_7ydLLbvEABTxbwM"
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  })
  .then(data => {
    const movies = data.results;
    const slider = document.querySelector(".trending__slider");
    slider.innerHTML = "";

    movies.forEach(movie => {
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
  .catch(error => {
    console.error("Fetch error:", error);
  });
}

window.onload = () => {
  getMovies("movie", "day");
};

const slider = document.querySelector(".trending__slider");
const btnLeft = document.querySelector(".slider-btn.left");
const btnRight = document.querySelector(".slider-btn.right");

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
