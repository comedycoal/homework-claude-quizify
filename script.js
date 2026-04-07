// Global game state
const game = {
  currentQuestion: 0,
  score: 0,
  streak: 0,
  answered: false,
  timeRemaining: 15,
  timerInterval: null,
  startTime: null,
  questionStartTime: null,
  answers: [],
  quizQuestions: [],
  selectedCategory: null,
  selectedCount: 10,
  categories: []
};

const TOTAL_TIME_PER_QUESTION = 15;
const LEADERBOARD_KEY = 'quizify_leaderboard';

// DOM Elements
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');

const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const saveScoreButton = document.getElementById('saveScoreButton');
const playerNameInput = document.getElementById('playerName');
const leaderboardList = document.getElementById('leaderboardList');

const questionText = document.getElementById('questionText');
const answersGrid = document.getElementById('answersGrid');
const timerText = document.getElementById('timerText');
const timerFill = document.getElementById('timerFill');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');
const questionNumber = document.getElementById('questionNumber');
const totalQuestions = document.getElementById('totalQuestions');
const categoryList = document.getElementById('categoryList');
const countBtns = document.querySelectorAll('.count-btn');

// Load categories and initialize
async function initializeCategories() {
  try {
    const response = await fetch('data/categories.json');
    const categories = await response.json();
    game.categories = categories;
    renderCategories();
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

function renderCategories() {
  categoryList.innerHTML = '';
  game.categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'category-card';
    button.dataset.category = category.name;
    button.innerHTML = `
      <span class="category-icon">${category.icon}</span>
      <span class="category-name">${category.name}</span>
    `;
    button.addEventListener('click', () => {
      document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
      button.classList.add('selected');
      game.selectedCategory = category.name;
      startButton.disabled = false;
    });
    categoryList.appendChild(button);
  });
}

countBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    countBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    game.selectedCount = parseInt(btn.dataset.count, 10);
  });
});

startButton.addEventListener('click', startQuiz);
restartButton.addEventListener('click', goToStart);
saveScoreButton.addEventListener('click', saveScore);
playerNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveScore();
  }
});

function goToStart() {
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
  game.selectedCategory = null;
  startButton.disabled = true;
  playerNameInput.value = '';
  showScreen('start');
}

function startQuiz() {
  game.currentQuestion = 0;
  game.score = 0;
  game.streak = 0;
  game.answered = false;
  game.answers = [];
  game.startTime = Date.now();
  updateStreakDisplay();

  // Build list of available categories that have questions
  const availableCategories = ['Geography', 'Science', 'History', 'Literature', 'Mathematics'];
  let categoryName = game.selectedCategory;

  // Map category names if needed (e.g., Mathematics -> Math)
  const categoryNameMap = {
    'Mathematics': 'Math'
  };

  if (categoryName === 'Random') {
    categoryName = availableCategories[Math.floor(Math.random() * availableCategories.length)];
  }

  // Apply mapping for database lookup
  const dbCategoryName = categoryNameMap[categoryName] || categoryName;

  let pool;
  if (categoryName === 'Mix') {
    pool = [...questions];
  } else {
    pool = questions.filter(q => q.category === dbCategoryName);
  }

  // Sort by difficulty, shuffle within difficulty groups
  let grouped = {};
  pool.forEach(q => {
    if (!grouped[q.difficulty]) grouped[q.difficulty] = [];
    grouped[q.difficulty].push(q);
  });

  let sorted = [];
  Object.keys(grouped).sort().forEach(difficulty => {
    shuffleArray(grouped[difficulty]);
    sorted = sorted.concat(grouped[difficulty]);
  });

  // Cap to selected count
  game.quizQuestions = sorted.slice(0, game.selectedCount);

  totalQuestions.textContent = game.quizQuestions.length;

  showScreen('quiz');
  loadQuestion();
}

function showScreen(screenName) {
  startScreen.classList.remove('active');
  quizScreen.classList.remove('active');
  resultsScreen.classList.remove('active');

  if (screenName === 'start') {
    startScreen.classList.add('active');
  } else if (screenName === 'quiz') {
    quizScreen.classList.add('active');
  } else if (screenName === 'results') {
    resultsScreen.classList.add('active');
  }
}

function loadQuestion() {
  // Clear previous timer
  if (game.timerInterval) {
    clearInterval(game.timerInterval);
  }

  const currentQ = game.quizQuestions[game.currentQuestion];

  // Update question display
  questionText.textContent = currentQ.text;
  questionNumber.textContent = game.currentQuestion + 1;

  // Clear previous answers
  answersGrid.innerHTML = '';

  // Create answer buttons
  currentQ.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'answer-btn';
    button.textContent = option;
    button.addEventListener('click', () => selectAnswer(index));
    answersGrid.appendChild(button);
  });

  // Reset timer and answered state
  game.answered = false;
  game.timeRemaining = TOTAL_TIME_PER_QUESTION;
  game.questionStartTime = Date.now();
  startTimer();
}

function startTimer() {
  updateTimerDisplay();

  game.timerInterval = setInterval(() => {
    game.timeRemaining--;
    updateTimerDisplay();

    if (game.timeRemaining <= 0) {
      clearInterval(game.timerInterval);
      if (!game.answered) {
        game.answers.push(null); // No answer selected
        nextQuestion();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerText.textContent = game.timeRemaining + 's';

  const percentage = (game.timeRemaining / TOTAL_TIME_PER_QUESTION) * 100;
  timerFill.style.width = percentage + '%';

  // Change color based on time remaining
  if (game.timeRemaining <= 5) {
    timerFill.classList.add('danger');
    timerFill.classList.remove('warning');
  } else if (game.timeRemaining <= 10) {
    timerFill.classList.add('warning');
    timerFill.classList.remove('danger');
  } else {
    timerFill.classList.remove('warning', 'danger');
  }
}

function selectAnswer(selectedIndex) {
  if (game.answered) return;

  game.answered = true;
  clearInterval(game.timerInterval);

  const currentQ = game.quizQuestions[game.currentQuestion];
  const isCorrect = selectedIndex === currentQ.correct;

  // Calculate time elapsed and determine points
  const timeElapsed = (Date.now() - game.questionStartTime) / 1000;
  const isQuickAnswer = timeElapsed < TOTAL_TIME_PER_QUESTION / 3;
  let basePoints = isCorrect ? (isQuickAnswer ? 10 : 5) : 0;

  // Update streak and apply multiplier
  if (isCorrect) {
    game.streak++;
  } else {
    game.streak = 0;
  }

  const multiplier = game.streak >= 5 ? 3 : game.streak >= 3 ? 2 : 1;
  const points = basePoints * multiplier;

  // Record answer
  game.answers.push({
    questionId: currentQ.id,
    selected: selectedIndex,
    correct: currentQ.correct,
    isCorrect: isCorrect,
    points: points,
    streak: game.streak,
    multiplier: multiplier
  });

  // Update score
  if (isCorrect) {
    game.score += points;
    scoreDisplay.textContent = game.score;
    updateStreakDisplay();

    // Show "QUICK ANSWER!" for +10 base points
    if (isQuickAnswer) {
      showQuickAnswerPrompt();
    }
  } else {
    updateStreakDisplay();
  }

  // Show visual feedback
  const answerButtons = document.querySelectorAll('.answer-btn');
  answerButtons.forEach((btn, index) => {
    btn.classList.add('disabled');

    if (index === currentQ.correct) {
      btn.classList.add('correct');
    } else if (index === selectedIndex && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  // Auto-advance after 1 second
  setTimeout(() => {
    nextQuestion();
  }, 1000);
}

function updateStreakDisplay() {
  const multiplier = game.streak >= 5 ? 3 : game.streak >= 3 ? 2 : 1;

  if (multiplier > 1) {
    streakDisplay.textContent = `(${multiplier}x)`;
    streakDisplay.className = `streak-multiplier active x${multiplier}`;
  } else {
    streakDisplay.textContent = '';
    streakDisplay.className = 'streak-multiplier';
  }
}

function showQuickAnswerPrompt() {
  const prompt = document.createElement('div');
  prompt.className = 'quick-answer-prompt';
  prompt.textContent = 'QUICK ANSWER!';
  document.body.appendChild(prompt);

  setTimeout(() => {
    if (prompt.parentNode) {
      prompt.remove();
    }
  }, 1500);
}

function nextQuestion() {
  game.currentQuestion++;

  if (game.currentQuestion < game.quizQuestions.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  clearInterval(game.timerInterval);

  const totalTime = Math.round((Date.now() - game.startTime) / 1000);
  const correctAnswers = game.answers.filter(a => a && a.isCorrect).length;
  const accuracy = Math.round((correctAnswers / game.quizQuestions.length) * 100);

  document.getElementById('finalScore').textContent = game.score;
  document.getElementById('accuracy').textContent = accuracy;
  document.getElementById('timeTaken').textContent = totalTime;

  playerNameInput.value = '';
  playerNameInput.focus();
  displayLeaderboard();

  showScreen('results');
}

function getLeaderboard() {
  const data = localStorage.getItem(LEADERBOARD_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLeaderboard(scores) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores));
}

function saveScore() {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Please enter your name');
    playerNameInput.focus();
    return;
  }

  const score = {
    name: name,
    score: game.score,
    date: new Date().toLocaleDateString()
  };

  const leaderboard = getLeaderboard();
  leaderboard.push(score);
  leaderboard.sort((a, b) => b.score - a.score);
  const topTen = leaderboard.slice(0, 10);

  saveLeaderboard(topTen);
  displayLeaderboard();

  playerNameInput.value = '';
  saveScoreButton.textContent = 'Score Saved!';
  setTimeout(() => {
    saveScoreButton.textContent = 'Save Score';
  }, 2000);
}

function displayLeaderboard() {
  const leaderboard = getLeaderboard();

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = '<p class="empty-leaderboard">No scores yet</p>';
    return;
  }

  leaderboardList.innerHTML = leaderboard.map((entry, index) => {
    const rank = index + 1;
    const topClass = rank <= 3 ? `top-${rank}` : '';
    return `
      <div class="leaderboard-entry ${topClass}">
        <span class="leaderboard-rank">#${rank}</span>
        <span class="leaderboard-name">${entry.name}</span>
        <span class="leaderboard-score">${entry.score}</span>
      </div>
    `;
  }).join('');
}

// Initialize on page load
initializeCategories();
showScreen('start');
displayLeaderboard();
