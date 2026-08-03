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

/**
 * Global reference to the application's state manager.
 * Declared at the root scope to allow UI controller functions 
 * to interface with the business logic.
 * @type {QuizState}
 */
let quizState;

/**
 * Asynchronously retrieves and parses the quiz dataset from the local environment.
 * @returns {Promise<Array<Object>>} A promise resolving to an array of question data.
 */
async function fetchQuizContent() {
  // Fetches the raw file and immediately parses the JSON stream into native JS structures
  return await fetch('questions.json').then(res => res.json());
}

/**
* Bootstraps the application on initial script load.
* Responsible for fetching data, hydrating the state manager, 
* and preparing the UI for user interaction.
*/
async function initializeApp() {
  try {
      // Await the asynchronous network request before proceeding
      const questionData = await fetchQuizContent();
      
      // Hydrate the state manager with the retrieved dataset
      quizState = new QuizState(questionData);
      
      // The data layer is now ready; the UI can safely interact with quizState
      console.log("Quiz initialized successfully with dataset:", quizState.questionData);
      
      // Note: Event listeners for the 'Start' button could be enabled here 
      // to prevent users from starting the quiz before the data payload is fully loaded.
  } catch (error) {
      // Failsafe in case the JSON file is missing or contains syntax errors
      console.error("Failed to initialize the quiz application data layer:", error);
  }
}

// Execute the bootstrap sequence immediately
initializeApp();

// ------------------------------------------------------------------------------



totalQuestionsSpan.textContent = quizQuestions.length;
maxScoreSpan.textContent= quizQuestions.length;

// event listeners
// Attach functions to buttons so they run when clicked
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

/**
 * Initiates a new quiz session by resetting the application state, 
 * synchronizing the DOM elements, managing screen visibility transitions, 
 * and triggering the rendering of the first question.
 */
function startQuiz() {
    // reset quiz state
    quizState.resetQuiz()
    
    // update score value
    scoreSpan.textContent = quizState.score

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
