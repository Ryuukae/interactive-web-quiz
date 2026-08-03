// DOM Elements
// We store references to these HTML elements in variables once, so we don't 
// have to force the browser to search for them every time they are needed.
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startButton = document.getElementById("start-btn");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("totalQuestionsSpan");
const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const restartButton = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");

// Quiz questions
// An array of objects. Each object represents one question and contains an 
// array of possible answers with a boolean indicating the correct one.
const quizQuestions = [
  {
    question: "What is the capital of France?",
    answers: [
      { text: "London", correct: false },
      { text: "Berlin", correct: false },
      { text: "Paris", correct: true },
      { text: "Madrid", correct: false },
    ],
  },
  {
    question: "Which planet is known as the Red Planet?",
    answers: [
      { text: "Venus", correct: false },
      { text: "Mars", correct: true },
      { text: "Jupiter", correct: false },
      { text: "Saturn", correct: false },
    ],
  },
  {
    question: "What is the largest ocean on Earth?",
    answers: [
      { text: "Atlantic Ocean", correct: false },
      { text: "Indian Ocean", correct: false },
      { text: "Arctic Ocean", correct: false },
      { text: "Pacific Ocean", correct: true },
    ],
  },
  {
    question: "Which of these is NOT a programming language?",
    answers: [
      { text: "Java", correct: false },
      { text: "Python", correct: false },
      { text: "Banana", correct: true },
      { text: "JavaScript", correct: false },
    ],
  },
  {
    question: "What is the chemical symbol for gold?",
    answers: [
      { text: "Go", correct: false },
      { text: "Gd", correct: false },
      { text: "Au", correct: true },
      { text: "Ag", correct: false },
    ],
  },
];

// QUIZ STATE VARS
// These variables track the user's progress and update as the quiz moves forward.
let currentQuestionIndex = 0;
let score = 0;
// Prevents the user from clicking multiple answers rapidly before the next question loads
let answersDisabled = false; 
// Initialize the total question count in the UI right away
totalQuestionsSpan.textContent = quizQuestions.length;
maxScoreSpan.textContent= quizQuestions.length;

// event listeners
// Attach functions to buttons so they run when clicked
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

function startQuiz(){
    console.log("quiz started");
    
    // Reset state to default values in case the user is restarting the quiz
    currentQuestionIndex = 0;
    score = 0;
    scoreSpan.textContent = score;

    // Swap the visible screens by toggling the "active" CSS class
    startScreen.classList.remove("active");
    quizScreen.classList.add("active");

    showQuestion();
}

function showQuestion() {
    // Re-enable clicks for the new question
    answersDisabled = false;  
    
    const currentQuestion = quizQuestions[currentQuestionIndex];

    // Update UI text (add 1 because arrays start at index 0)
    currentQuestionSpan.textContent = currentQuestionIndex + 1;

    // Calculate and apply progress bar width dynamically
    const progressPercent = (currentQuestionIndex / quizQuestions.length) * 100;
    progressBar.style.width = progressPercent + "%";
    
    questionText.textContent = currentQuestion.question;
    
    // Clear out any old answer buttons from the previous question
    answersContainer.innerHTML = "";

    // Loop through the current question's answers to generate fresh buttons
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = answer.text;
        button.classList.add("answer-btn");

        // Store the correct/false boolean in a data attribute directly on the HTML element
        button.dataset.correct = answer.correct;

        // When this specific dynamically-created button is clicked, check the answer
        button.addEventListener("click", selectAnswer);

        answersContainer.appendChild(button);
    });
}

function selectAnswer(event) {
    // state check: If an answer was already clicked, ignore subsequent clicks
    if (answersDisabled) return;

    // Lock in the choice
    answersDisabled = true;
    
    // 'event.target' refers to the exact button the user clicked
    const selectedButton = event.target;
    // Check our hidden data attribute to see if they got it right
    const isCorrect = selectedButton.dataset.correct === "true";

    // Loop through ALL buttons to reveal which ones were right/wrong visually
    Array.from(answersContainer.children).forEach((button) => {
        if(button.dataset.correct === "true") {
            button.classList.add("correct");
        } else {
            button.classList.add("incorrect");
        }
    });

    if(isCorrect) {
        score++;
        scoreSpan.textContent = score;
    }

    // Pause for 1 second (1000ms) so the user can see if they were right before moving on
    setTimeout(() => {
        currentQuestionIndex++;

        // If we haven't reached the end of the array, show the next question
        if(currentQuestionIndex < quizQuestions.length) {
         showQuestion();
        } else {
            // Otherwise, wrap it up
            showResults();
        }
    }, 1000);
}

function showResults() {
    // Hide quiz, show results screen
    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");

    finalScoreSpan.textContent = score;

    // Calculate final percentage
    const percentage = (score / quizQuestions.length) * 100;

    // Provide a custom message based on performance
    // Note: If you add/remove questions later so the total isn't exactly 5, 
    // these strict === checks might break. You may want to change these to >= 
    // (e.g., if percentage >= 80) in the future!
    if(percentage === 100) {
        resultMessage.textContent = "Perfect Score!";
    } else if (percentage === 80){
        resultMessage.textContent = "Great Job!";
    } else if (percentage === 60){
        resultMessage.textContent = "Good Effort!";
    } else if (percentage === 40) {
        resultMessage.textContent = "Not bad!";
    } else {
        resultMessage.textContent = "Needs Improvement!";
    }
}

function restartQuiz() {
    console.log("quiz restarted");
    // Hide the results screen and trigger the start flow again
    resultScreen.classList.remove("active");
    startQuiz();
}