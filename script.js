// Sounds
const clickSound = document.getElementById('clickSound');
const successSound = document.getElementById('successSound');
function playClick(){ clickSound.currentTime=0; clickSound.play(); }
function playSuccess(){ successSound.currentTime=0; successSound.play(); }

// Tabs
const tabs = document.querySelectorAll('.tab');
const games = document.querySelectorAll('.game');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.target;
    games.forEach(g=>g.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// ------------------ QUIZ GAME ------------------ //
let quizLevels = {
  1:[
    {q:"What is 2+2?", options:["3","4","5","6"], answer:"4"},
    {q:"Capital of South Africa?", options:["Pretoria","Cairo","Nairobi","Lagos"], answer:"Pretoria"}
  ],
  2:[
    {q:"HTML stands for?", options:["Hyper Text Markup Language","High Text Machine Language","Hot Mail","None"], answer:"Hyper Text Markup Language"},
    {q:"JS is?", options:["JavaScript","JustScript","JumboScript","None"], answer:"JavaScript"}
  ],
  3:[
    {q:"CSS is used for?", options:["Styling","Logic","Database","Network"], answer:"Styling"},
    {q:"2*6=?", options:["8","10","12","14"], answer:"12"}
  ]
};

let quizState = JSON.parse(localStorage.getItem('quizState')) || {level:1, index:0, score:0};
let currentQuiz = quizLevels[quizState.level];
let quizIndex = quizState.index;
let score = quizState.score;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const scoreEl = document.getElementById('quiz-score');

function saveQuizState(){
  localStorage.setItem('quizState', JSON.stringify({level:quizState.level,index:quizIndex,score:score}));
}

function displayLeaderboard(game){
  const key = game+'Leaderboard';
  const lb = JSON.parse(localStorage.getItem(key)) || [];
  const ol = document.getElementById(game+'-leaderboard');
  ol.innerHTML = '';
  lb.forEach((item,i)=>{
    const li = document.createElement('li');
    li.textContent = `Level ${item.level} - ${item.name}: ${item.score}`;
    li.className = '';
    if(i===0) li.classList.add('top');
    else if(i===1) li.classList.add('second');
    else if(i===2) li.classList.add('third');
    setTimeout(()=>{ li.style.opacity=1; li.style.transform='translateX(0)'; }, i*200);
    ol.appendChild(li);
  });
}

function updateLeaderboard(game, name, score, level){
  const key = game+'Leaderboard';
  let lb = JSON.parse(localStorage.getItem(key)) || [];
  lb.push({name:name, score:score, level:level});
  lb.sort((a,b)=>b.score - a.score);
  if(lb.length>10) lb=lb.slice(0,10);
  localStorage.setItem(key, JSON.stringify(lb));
  displayLeaderboard(game);
}

function loadQuiz(){
  const current = currentQuiz[quizIndex];
  if(!current) return finishQuiz();
  questionEl.textContent = current.q;
  optionsEl.innerHTML = '';
  current.options.forEach(opt=>{
    const div = document.createElement('div');
    div.textContent = opt;
    div.classList.add('option');
    div.addEventListener('click', ()=>{
      playClick();
      if(opt===current.answer) score++;
      quizIndex++;
      saveQuizState();
      loadQuiz();
      scoreEl.textContent = `Score: ${score}`;
    });
    optionsEl.appendChild(div);
  });
}

function finishQuiz(){
  questionEl.textContent = `Level ${quizState.level} Finished!`;
  optionsEl.innerHTML = '';
  scoreEl.textContent = `Score: ${score}`;
  playSuccess();
  const name = prompt("Enter your name for the leaderboard:") || "Player";
  updateLeaderboard('quiz', name, score, quizState.level);
  showNextLevelQuiz();
}

function showNextLevelQuiz(){
  const nextBtn = document.createElement('button');
  nextBtn.textContent = "Next Level";
  nextBtn.style = "margin-top:10px;padding:0.5rem 1rem;border-radius:10px;background:gold;color:#000;font-weight:700;cursor:pointer;";
  nextBtn.addEventListener('click', ()=>{
    quizState.level++;
    quizIndex = 0;
    score = 0;
    currentQuiz = quizLevels[quizState.level] || quizLevels[1];
    saveQuizState();
    loadQuiz();
    nextBtn.remove();
  });
  document.getElementById('quiz').appendChild(nextBtn);
}

document.getElementById('restart-quiz').addEventListener('click', ()=>{
  playClick();
  quizIndex = 0;
  score = 0;
  currentQuiz = quizLevels[quizState.level];
  saveQuizState();
  loadQuiz();
});

loadQuiz();
displayLeaderboard('quiz');

// ------------------ MEMORY GAME ------------------ //
const memoryEl = document.getElementById('memory');
let memorySymbols = ["🍎","🍌","🍇","🍉","🍒","🍓","🍍","🥝"];
let memoryState = JSON.parse(localStorage.getItem('memoryState')) || {level:1};
let firstCard=null, secondCard=null, matchedCount=0, startTime=null;

function loadMemoryLevel(level){
  memoryEl.innerHTML = '';
  const cardsCount = Math.min(memorySymbols.length, 2 + level*2);
  let cards = [...memorySymbols.slice(0,cardsCount/2), ...memorySymbols.slice(0,cardsCount/2)];
  cards.sort(()=>Math.random()-0.5);
  matchedCount=0;
  firstCard=null; secondCard=null; startTime=null;
  cards.forEach(sym=>{
    const div = document.createElement('div');
    div.classList.add('card');
    div.textContent = sym;
    memoryEl.appendChild(div);
  });
}

function saveMemoryState(){
  localStorage.setItem('memoryState', JSON.stringify(memoryState));
}

function showNextMemoryLevel(){
  const btn = document.createElement('button');
  btn.textContent = "Next Level";
  btn.style = "margin-top:10px;padding:0.5rem 1rem;border-radius:10px;background:gold;color:#000;font-weight:700;cursor:pointer;";
  btn.addEventListener('click', ()=>{
    memoryState.level++;
    saveMemoryState();
    loadMemoryLevel(memoryState.level);
    btn.remove();
  });
  memoryEl.parentElement.appendChild(btn);
}

memoryEl.addEventListener('click', e=>{
  const target = e.target;
  if(!target.classList.contains('card') || target.classList.contains('flipped') || target.classList.contains('matched')) return;
  target.classList.add('flipped');
  playClick();
  if(!startTime) startTime = Date.now();
  if(!firstCard) firstCard = target;
  else{
    secondCard = target;
    if(firstCard.textContent===secondCard.textContent){
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      matchedCount +=2;
      playSuccess();
      firstCard=null; secondCard=null;
      if(matchedCount===memoryEl.children.length){
        const endTime = Date.now();
        const timeTaken = Math.floor((endTime - startTime)/1000);
        alert(`Memory Level ${memoryState.level} Completed in ${timeTaken} seconds!`);
        const name = prompt("Enter your name for the leaderboard:") || "Player";
        updateLeaderboard('memory', name, Math.max(0,100 - timeTaken), memoryState.level);
        showNextMemoryLevel();
      }
    } else {
      setTimeout(()=>{ firstCard.classList.remove('flipped'); secondCard.classList.remove('flipped'); firstCard=null; secondCard=null; },1000);
    }
  }
});

document.getElementById('restart-memory').addEventListener('click', ()=>{
  playClick();
  loadMemoryLevel(memoryState.level);
});

loadMemoryLevel(memoryState.level);
displayLeaderboard('memory');
