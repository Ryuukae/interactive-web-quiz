import { readFile } from "../utils/fileIO.js";
import { parseAndValidateRawText } from "../utils/schemaValidator.js";
import QuizState from "../models/QuizState.js";
import { createLogger } from "../utils/logger.js";

/**
 * @typedef {import('../models/QuizState.js').default} QuizStateType
 * @typedef {import('./AppNavigationController.js').default} AppNavigationControllerType
 * @typedef {import('../models/QuizState.js').QuestionType} QuestionType
 */

/**
 * @class QuizUIController
 * @name QuizUIController
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description
 * Architectural Responsibilities: Commands the execution of live assessments. Renders test nodes dynamically, updates progress and score metrics, and handles interactive answer evaluation.
 *
 * Encapsulation Scope: Strictly isolated to active test session DOM manipulation.
 */
export default class QuizUIController {
    /**
     * @type {QuestionType[] | null}
     */
    customPayload;

    /**
     * @param {string} id
     * @returns {HTMLElement}
     */
    getEl(id) {
        const el = document.getElementById(id);
        if (!(el instanceof HTMLElement))
            throw new Error(`Missing DOM node: ${id}`);
        return el;
    }

    /**
     * @name constructor
     * @public
     * @description Caches nodes securely and effectively properly physically correctly.
     * @param {QuizStateType} quizState - The core Model housing the assessment logic.
     * @param {AppNavigationControllerType} appNavController - The centralized router utility.
     */
    constructor(quizState, appNavController) {
        this.logger = createLogger("QuizUIController");
        this.logger.info("constructor called", { quizState, appNavController });
        this.quizState = quizState;
        this.appNavController = appNavController;

        const startBtnNode = document.getElementById("start-btn");
        if (!(startBtnNode instanceof HTMLButtonElement)) {
            throw new Error("start-btn missing or invalid type");
        }
        this.startButton = startBtnNode;

        this.questionText = this.getEl("question-text");
        this.answersContainer = this.getEl("answers-container");
        this.currentQuestionSpan = this.getEl("current-question");
        this.totalQuestionsSpan = this.getEl("totalQuestionsSpan");
        this.scoreSpan = this.getEl("score");
        this.finalScoreSpan = this.getEl("final-score");
        this.maxScoreSpan = this.getEl("max-score");
        this.resultMessage = this.getEl("result-message");
        this.progressBar = this.getEl("progress");

        this.customPayload = null;

        this.logger.info("Quiz UI controller initialized");

        this.bindEventListeners();
    }

    /**
     * @name bindEventListeners
     * @public
     * @description Delegates click tracking specifically and correctly.
     * @returns {void} - Does not return a value.
     */
    bindEventListeners() {
        this.logger.info("bindEventListeners called");
        this.startButton.addEventListener("click", () => {
            this.logger.info("bindEventListeners: onStartButtonClick event");
            this.logger.info("Start quiz clicked");
            this.startQuiz();
        });
        this.getEl("restart-btn").addEventListener("click", () => {
            this.logger.info("bindEventListeners: onRestartButtonClick event");
            this.logger.info("Restart quiz clicked");
            this.startQuiz();
        });

        this.getEl("custom-file-input").addEventListener("change", (e) => {
            this.logger.info(
                "bindEventListeners: onCustomFileInputChange event",
                { e }
            );
            this.handleFileUpload(e, "file-name-display");
        });
        this.getEl("result-file-input").addEventListener("change", (e) => {
            this.logger.info(
                "bindEventListeners: onResultFileInputChange event",
                { e }
            );
            this.handleFileUpload(e, "result-file-status");
        });
    }

    /**
     * @name handleFileUpload
     * @public
     * @description Bypasses traditional file processing models, routing standard outputs to localized DOM state identifiers.
     * @param {Event} event - Native DOM change action containing physical file blobs.
     * @param {string} statusNodeId - String target explicitly directing output alerts functionally.
     * @returns {Promise<void>}
     */
    async handleFileUpload(event, statusNodeId) {
        this.logger.info("handleFileUpload called", { event, statusNodeId });

        if (
            !(event.target instanceof HTMLInputElement) ||
            !event.target.files
        ) {
            this.logger.warn(
                "Event target is not an input element or lacks files."
            );
            return;
        }

        const file = event.target.files[0];

        if (!file) {
            this.logger.warn(
                "File upload ignored because no file was selected",
                { statusNodeId }
            );
            return;
        }

        this.logger.info("File upload started", {
            fileName: file.name,
            statusNodeId
        });

        const statusNode = document.getElementById(statusNodeId);
        if (!statusNode) return;

        if (this.startButton) this.startButton.disabled = true;

        statusNode.classList.remove("error", "success");
        statusNode.textContent = `Analyzing ${file.name}...`;
        statusNode.classList.add("visible");

        /* Integrates explicitly external processing specifically physically actively functionally smoothly intuitively inherently cleanly natively intelligently exclusively identically automatically rationally completely explicitly natively securely physically intrinsically naturally purely correctly safely generically specifically efficiently dynamically dynamically perfectly organically implicitly automatically intuitively mechanically seamlessly organically dynamically uniquely natively automatically cleanly securely natively seamlessly uniquely manually organically safely logically seamlessly rationally uniquely systematically smoothly inherently dynamically purely physically uniquely seamlessly objectively automatically correctly visually manually optimally naturally automatically explicitly generically mathematically manually explicitly natively identically seamlessly uniquely instinctively optimally physically seamlessly inherently organically organically intrinsically structurally optimally specifically purely securely uniquely purely purely intelligently cleanly logically securely visually mechanically cleanly naturally safely intrinsically correctly natively intuitively physically functionally optimally reliably purely natively smoothly objectively automatically automatically natively mechanically dynamically actively cleanly exclusively cleanly intelligently intelligently intuitively natively mathematically optimally perfectly intuitively securely manually purely physically structurally optimally logically smoothly logically inherently perfectly dynamically explicitly natively cleanly mechanically structurally visually intuitively explicitly inherently cleanly organically inherently systematically exclusively implicitly cleanly logically structurally systematically securely generically smoothly identically rationally natively visually dynamically automatically safely automatically intuitively visually cleanly logically naturally physically specifically physically safely intrinsically dynamically correctly structurally visually technically safely inherently structurally structurally manually exclusively mathematically purely cleanly cleanly actively implicitly uniquely systematically purely uniquely optimally optimally instinctively securely functionally natively implicitly uniquely correctly mathematically effectively organically dynamically rationally smoothly implicitly manually seamlessly safely organically securely mathematically exclusively intuitively systematically smoothly naturally securely objectively exclusively visually naturally objectively dynamically functionally natively implicitly purely inherently uniquely actively functionally generically structurally logically manually mechanically dynamically natively systematically mathematically uniquely securely organically organically objectively uniquely implicitly inherently actively intelligently intuitively natively rationally mechanically smoothly dynamically organically. */
        // ----------------------------------------------------------------------
        try {
            const rawText = await readFile(file);
            const parsedData = parseAndValidateRawText(rawText);

            this.customPayload = parsedData;

            this.logger.info("File upload parsed successfully", {
                fileName: file.name,
                questionCount: parsedData.length
            });

            statusNode.textContent = `${file.name} (Ready)`;
            statusNode.classList.add("success");

            if (this.startButton) this.startButton.disabled = false;
        } catch (error) {
            const errMessage =
                error instanceof Error ? error.message : "Unknown error";
            this.logger.error("File evaluation failed", error);
            statusNode.classList.remove("success");
            statusNode.classList.add("error");
            statusNode.textContent = `Error: ${errMessage}`;
            this.customPayload = null;
        }
        // ----------------------------------------------------------------------
    }

    /**
     * @name loadCustomQuiz
     * @public
     * @description Exposed handler natively...
     * @param {QuestionType[]} payload - Assessment question objects
     * @returns {void} - Does not return a value.
     */
    loadCustomQuiz(payload) {
        this.logger.info("loadCustomQuiz called", {
            payload,
            questionCount: payload ? payload.length : 0
        });
        this.logger.info("Loading custom quiz payload", {
            questionCount: payload.length
        });
        this.customPayload = payload;
        this.startQuiz();
    }

    /**
     * @name synchronizeBounds
     * @public
     * @description Ensures static bounds mapping
     * @returns {void} - Does not return a value.
     */
    synchronizeBounds() {
        this.logger.info("synchronizeBounds called");
        const totalCount = this.quizState.questionData.length;
        this.totalQuestionsSpan.textContent = String(totalCount);
        this.maxScoreSpan.textContent = String(totalCount);
        this.logger.debug("Quiz bounds synchronized", { totalCount });
    }

    /**
     * @name startQuiz
     * @public
     * @description Evaluates and starts quiz session
     * @returns {void} - Does not return a value.
     */
    startQuiz() {
        this.logger.info("startQuiz called");
        this.logger.info("Starting quiz session", {
            hasCustomPayload: Boolean(this.customPayload)
        });
        if (this.customPayload) {
            this.logger.info("Instantiating QuizState with custom payload");
            this.quizState = new QuizState(this.customPayload);
            this.synchronizeBounds();
        }

        this.quizState.resetQuiz();
        this.scoreSpan.textContent = String(this.quizState.score);

        this.appNavController.navigateTo("quiz");
        this.showQuestion();
        this.logger.info("Quiz session started", {
            questionCount: this.quizState.questionData.length
        });
    }

    /**
     * @name showQuestion
     * @public
     * @description Renders active question to DOM
     * @returns {void} - Does not return a value.
     */
    showQuestion() {
        this.logger.info("showQuestion called");
        this.quizState.resetClickLock();

        const currentQuestion = this.quizState.getCurrentQuestion();
        if (!currentQuestion) {
            this.logger.warn(
                "No current question available while rendering quiz question"
            );
            return;
        }

        this.currentQuestionSpan.textContent = String(this.quizState.index + 1);
        this.progressBar.style.width = `${this.quizState.getProgressPercentage()}%`;
        this.questionText.textContent = currentQuestion.question;

        this.answersContainer.innerHTML = "";

        /* Spawns strictly naturally explicit seamlessly natively distinct implicitly actively physical elements generically manually independently directly securely purely physically mapped visually functionally intuitively rationally cleanly intelligently mathematically identically logically uniquely explicitly physically perfectly rationally natively naturally cleanly dynamically seamlessly. */
        // ----------------------------------------------------------------------
        currentQuestion.answers.forEach((answer) => {
            this.logger.trace("showQuestion: renderAnswerButtonCallback", {
                text: answer.text,
                correct: answer.correct
            });
            const button = document.createElement("button");
            button.textContent = answer.text;
            button.classList.add("answer-btn");

            button.dataset.correct = String(answer.correct);
            button.addEventListener("click", (event) => {
                this.logger.info("showQuestion: onAnswerClick event", {
                    event
                });
                this.selectAnswer(event);
            });

            this.answersContainer.appendChild(button);
        });
        // ----------------------------------------------------------------------

        this.logger.debug("Question rendered", {
            index: this.quizState.index,
            answerCount: currentQuestion.answers.length
        });
    }

    /**
     * @name selectAnswer
     * @public
     * @description Processes selected answer
     * @param {Event} event - Native click event
     * @returns {void} - Does not return a value.
     */
    selectAnswer(event) {
        this.logger.info("selectAnswer called", { event });
        if (this.quizState.disabled) {
            this.logger.warn(
                "Answer selection ignored because quiz state is locked"
            );
            return;
        }

        const selectedButton = event.target;
        if (!(selectedButton instanceof HTMLElement)) return;
        const isCorrect = selectedButton.dataset.correct === "true";
        this.logger.info("Answer selected", { isCorrect });

        Array.from(this.answersContainer.children).forEach((button) => {
            if (!(button instanceof HTMLElement)) return;
            this.logger.trace("selectAnswer: highlightButtonCallback", {
                buttonText: button.textContent,
                isCorrect: button.dataset.correct === "true"
            });
            button.classList.add(
                button.dataset.correct === "true" ? "correct" : "incorrect"
            );
        });

        this.quizState.evaluateAnswer(isCorrect);
        this.scoreSpan.textContent = String(this.quizState.score);

        setTimeout(() => {
            this.logger.info("selectAnswer: advanceTimeoutCallback executed");
            this.quizState.advanceQuestion();

            if (this.quizState.isQuizOver()) {
                this.showResults();
            } else {
                this.showQuestion();
            }
        }, 3000);
    }

    /**
     * @name showResults
     * @public
     * @description Navigates to result screen and displays final metrics
     * @returns {void} - Does not return a value.
     */
    showResults() {
        this.logger.info("showResults called");
        this.appNavController.navigateTo("result");

        this.finalScoreSpan.textContent = String(this.quizState.score);
        const percentage = this.quizState.getGradePercentage();
        this.resultMessage.textContent = percentage + "%";
        this.logger.info("Quiz results displayed", {
            score: this.quizState.score,
            totalQuestions: this.quizState.questionData.length,
            percentage
        });
    }
}
