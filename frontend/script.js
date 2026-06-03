document.addEventListener("DOMContentLoaded", () => {
    const startScreen = document.getElementById("start-screen");
    const gameContainer = document.getElementById("game-container");
    const gameOverScreen = document.getElementById("game-over-screen");
    const playerNameInput = document.getElementById("player-name");
    const genreButtons = document.querySelectorAll(".genre-btn");
    const playerDisplay = document.getElementById("player-display");
    const currentScoreDisplay = document.getElementById("current-score");
    const totalScoreDisplay = document.getElementById("total-score");
    const countdownDisplay = document.getElementById("countdown");
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("options-container");
    const roundInfo = document.getElementById("round-info");
    const songPreview = document.getElementById("song-preview");
    const finalScore = document.getElementById("final-score");
    const highScoreDisplay = document.getElementById("high-score-display");
    const playAgainBtn = document.getElementById("play-again-btn");
    const muteBtn = document.getElementById("mute-btn");
    const closeBtn = document.getElementById("close-btn");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
  
    let playerName = "";
    let musicFolder = "";
    let score = 0;
    let currentRound = 1;
    const totalRounds = 5;
    let highScore = localStorage.getItem("highScore") || 0;
    let isMuted = false;
  
    totalScoreDisplay.innerText = totalRounds * 10;
    highScoreDisplay.innerText = highScore;
  
    genreButtons.forEach(button => {
      button.addEventListener("click", () => {
        playerName = playerNameInput.value.trim();
        if (!playerName) return alert("Enter your name!");
        musicFolder = button.getAttribute("data-folder");
        startScreen.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        playerDisplay.innerText = `🎵 ${playerName}`;
        startRound();
      });
    });
  
    muteBtn.addEventListener("click", () => {
      isMuted = !isMuted;
      songPreview.muted = isMuted;
      muteBtn.innerText = isMuted ? "🔈" : "🔇";
    });
  
    fullscreenBtn.addEventListener("click", () => {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    });
  
    closeBtn.addEventListener("click", () => {
      if (confirm("Exit game?")) window.location.reload();
    });
  
    playAgainBtn.addEventListener("click", () => {
      gameOverScreen.classList.add("hidden");
      startScreen.classList.remove("hidden");
      score = 0;
      currentRound = 1;
      currentScoreDisplay.innerText = "0";
    });
  
    async function startRound() {
      if (currentRound > totalRounds) return endGame();
  
      roundInfo.innerText = `ROUND ${currentRound}`;
      countdownDisplay.innerText = "5";
  
      const songs = await fetchSongs(musicFolder);
      if (!songs.length) return alert("No songs found!");
  
      const songIndex = Math.floor(Math.random() * songs.length);
      const selectedSong = songs[songIndex];
  
      songPreview.src = `http://localhost:5001/${selectedSong}`;
      songPreview.currentTime = 60;
  
      let countdown = 5;
      const timer = setInterval(() => {
        countdown--;
        countdownDisplay.innerText = countdown;
        if (countdown === 0) {
          clearInterval(timer);
          songPreview.play().catch(() => {
            console.warn("Autoplay blocked");
          });
          setTimeout(() => {
            songPreview.pause();
          }, 10000);
        }
      }, 1000);
  
      questionText.innerText = "Guess the song!";
      const options = shuffle(songs.map(s => s.split("/").pop().replace(".mp3", ""))).slice(0, 4);
  
      optionsContainer.innerHTML = "";
      options.forEach(opt => {
        const btn = document.createElement("button");
        btn.classList.add("option");
        btn.innerText = opt;
        btn.addEventListener("click", () => checkAnswer(opt, selectedSong));
        optionsContainer.appendChild(btn);
      });
    }
  
    async function fetchSongs(folder) {
      try {
        const res = await fetch(`http://localhost:5001/get-songs/${folder}`);
        const data = await res.json();
        return data.songs || [];
      } catch (err) {
        console.error("Fetch error:", err);
        return [];
      }
    }
  
    function checkAnswer(answer, correctPath) {
      const correct = correctPath.split("/").pop().replace(".mp3", "");
      if (answer.toLowerCase() === correct.toLowerCase()) {
        score += 10;
        currentScoreDisplay.innerText = score;
      }
      currentRound++;
      startRound();
    }
  
    function endGame() {
      songPreview.pause();
      gameContainer.classList.add("hidden");
      gameOverScreen.classList.remove("hidden");
      finalScore.innerText = score;
  
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreDisplay.innerText = highScore;
      }
    }
  
    function shuffle(arr) {
      return arr.sort(() => Math.random() - 0.5);
    }
  });
  