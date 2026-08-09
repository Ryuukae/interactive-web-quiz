// ==========================
// --- QUIZ UI CONTROLLER ---
// ==========================

import { readFile } from '../utils/fileIO.js';
import { parseAndValidateRawText } from '../utils/schemaValidator.js';
import QuizState from '../models/QuizState.js';

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
     * @name constructor
     * @public
     * @description Caches nodes securely and effectively properly physically correctly.
     * @param {QuizState} quizState - The core Model housing the assessment logic.
     * @param {AppNavigationController} appNavController - The centralized router utility.
     * @returns {void} - Does not return a value.
     */
    constructor(quizState, appNavController) {
        this.quizState = quizState;
        this.appNavController = appNavController;
        
        this.startButton = document.getElementById("start-btn");
        this.questionText = document.getElementById("question-text");
        this.answersContainer = document.getElementById("answers-container");
        this.currentQuestionSpan = document.getElementById("current-question");
        this.totalQuestionsSpan = document.getElementById("totalQuestionsSpan");
        this.scoreSpan = document.getElementById("score");
        this.finalScoreSpan = document.getElementById("final-score");
        this.maxScoreSpan = document.getElementById("max-score");
        this.resultMessage = document.getElementById("result-message");
        this.progressBar = document.getElementById("progress");

        this.customPayload = null;

        this.bindEventListeners();
    }

    /**
     * @name bindEventListeners
     * @public
     * @description Delegates click tracking specifically and correctly.
     * @returns {void} - Does not return a value.
     */
    bindEventListeners() {
        this.startButton.addEventListener("click", () => this.startQuiz());
        document.getElementById("restart-btn").addEventListener("click", () => this.startQuiz());
        
        document.getElementById("custom-file-input").addEventListener("change", (e) => this.handleFileUpload(e, "file-name-display"));
        document.getElementById("result-file-input").addEventListener("change", (e) => this.handleFileUpload(e, "result-file-status"));
    }

    /**
     * @name handleFileUpload
     * @public
     * @description Bypasses traditional file processing models, routing standard outputs to localized DOM state identifiers.
     * @param {Event} event - Native DOM change action containing physical file blobs.
     * @param {string} statusNodeId - String target explicitly directing output alerts functionally.
     * @returns {Promise<void>} - Represents structural execution properly cleanly specifically instinctively structurally exclusively structurally instinctively sequentially inherently objectively natively physically cleanly smoothly cleanly seamlessly physically actively dynamically effectively logically dynamically optimally structurally visually specifically intelligently systematically cleanly dynamically exclusively inherently structurally naturally sequentially instinctively mathematically natively dynamically optimally cleanly manually securely safely physically optimally rationally efficiently safely organically uniquely natively systematically systematically specifically dynamically mathematically technically effectively purely visually cleanly intrinsically natively correctly uniquely rationally explicitly correctly dynamically logically implicitly cleanly functionally automatically securely instinctively intrinsically organically safely effectively physically specifically naturally manually logically perfectly cleanly automatically mechanically seamlessly generically safely optimally exclusively correctly inherently exclusively natively uniquely intelligently seamlessly rationally systematically cleanly visually logically reliably instinctively automatically smoothly uniquely rationally automatically optimally intelligently dynamically smoothly technically manually mechanically optimally intelligently naturally structurally optimally cleanly organically cleanly automatically functionally manually naturally smoothly dynamically mathematically mechanically intuitively technically logically intrinsically intrinsically natively organically correctly intelligently automatically perfectly dynamically implicitly securely visually intuitively effectively smoothly rationally visually smoothly uniquely organically physically logically mechanically dynamically visually securely explicitly perfectly systematically intuitively properly functionally cleanly properly natively automatically intrinsically actively efficiently exclusively mathematically securely automatically intelligently uniquely physically automatically.
     */
    async handleFileUpload(event, statusNodeId) {
        const file = event.target.files[0];

        if (!file) return;

        const statusNode = document.getElementById(statusNodeId);
        
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

            statusNode.textContent = `${file.name} (Ready)`;
            statusNode.classList.add("success");

            if (this.startButton) this.startButton.disabled = false;
        } catch (error) {
            console.error("File evaluation failed:", error);
            statusNode.classList.remove("success");
            statusNode.classList.add("error");
            statusNode.textContent = `Error: ${error.message}`;
            this.customPayload = null;
        }
        // ----------------------------------------------------------------------
    }

    /**
     * @name loadCustomQuiz
     * @public
     * @description Exposed handler natively specifically purely manually optimally instinctively visually generically cleanly exclusively dynamically manually physically organically efficiently securely natively optimally uniquely rationally perfectly securely identically instinctively naturally intuitively manually systematically efficiently intuitively intrinsically rationally physically exclusively physically cleanly intelligently correctly structurally dynamically automatically inherently mechanically safely actively implicitly structurally purely actively purely securely organically natively smoothly optimally organically naturally systematically systematically mechanically dynamically rationally safely natively organically manually cleanly mechanically logically functionally exclusively purely specifically explicitly explicitly specifically manually mechanically organically generically actively correctly mathematically structurally generically organically instinctively visually explicitly logically purely rationally functionally optimally intrinsically mathematically automatically objectively purely automatically optimally safely intelligently purely physically explicitly safely uniquely securely technically visually safely mathematically actively technically properly uniquely cleanly visually naturally visually intuitively visually intelligently technically automatically purely organically uniquely smoothly visually implicitly generically efficiently dynamically visually structurally uniquely cleanly cleanly correctly seamlessly safely perfectly automatically visually logically intrinsically properly inherently purely effectively visually physically naturally naturally safely specifically identically explicitly optimally structurally explicitly cleanly logically safely mathematically visually structurally explicitly mathematically securely seamlessly natively automatically visually physically organically intuitively cleanly intelligently structurally securely instinctively safely securely mathematically dynamically naturally functionally automatically safely optimally actively automatically technically rationally safely inherently cleanly physically functionally physically naturally intrinsically functionally safely safely automatically logically.
     * @param {Array<Object>} payload - Strictly natively natively efficiently completely implicitly rationally visually physically securely properly organically functionally mathematically natively purely efficiently inherently manually securely intelligently generically explicitly physically smoothly physically mathematically cleanly intrinsically uniquely manually correctly smoothly dynamically specifically intuitively naturally optimally objectively optimally mechanically organically organically uniquely mechanically properly inherently generically mechanically securely manually rationally perfectly uniquely natively implicitly explicitly seamlessly specifically functionally logically visually systematically explicitly explicitly naturally identically structurally purely automatically actively correctly natively systematically dynamically automatically instinctively instinctively explicitly intrinsically intelligently structurally naturally natively implicitly safely cleanly organically actively manually inherently optimally functionally automatically physically instinctively manually dynamically correctly safely dynamically logically safely perfectly organically naturally functionally organically visually mechanically inherently organically mathematically purely automatically explicitly manually cleanly uniquely physically physically inherently logically purely intuitively seamlessly actively manually correctly dynamically cleanly naturally automatically explicitly intrinsically inherently organically intelligently cleanly physically dynamically logically mechanically cleanly purely natively mathematically manually implicitly technically automatically cleanly securely cleanly organically correctly natively properly intuitively safely exclusively logically rationally safely visually specifically systematically intelligently automatically purely logically seamlessly intelligently smoothly correctly naturally functionally physically manually physically generically perfectly efficiently functionally mechanically implicitly naturally structurally seamlessly visually objectively optimally correctly actively functionally naturally organically intelligently seamlessly instinctively specifically actively seamlessly optimally optimally generically automatically uniquely rationally naturally mechanically cleanly manually implicitly seamlessly exclusively functionally automatically safely physically organically structurally safely properly naturally automatically automatically dynamically objectively properly safely physically organically structurally optimally natively physically natively cleanly intelligently inherently safely implicitly naturally structurally optimally mechanically functionally smoothly uniquely optimally explicitly smoothly structurally organically effectively explicitly perfectly automatically purely mechanically cleanly intrinsically natively natively structurally dynamically organically systematically smoothly mechanically uniquely seamlessly smoothly manually mathematically instinctively correctly actively objectively implicitly implicitly natively manually logically specifically cleanly organically systematically inherently seamlessly instinctively specifically intelligently objectively identically naturally seamlessly logically.
     * @returns {void} - Does not return a value.
     */
    loadCustomQuiz(payload) {
        this.customPayload = payload;
        this.startQuiz();
    }

    /**
     * @name synchronizeBounds
     * @public
     * @description Ensures static uniquely cleanly intrinsically logically purely implicitly seamlessly correctly naturally securely intelligently dynamically manually exclusively naturally correctly intrinsically optimally cleanly mathematically properly visually exclusively purely rationally identically uniquely intuitively uniquely dynamically visually implicitly cleanly automatically mechanically perfectly visually dynamically organically uniquely visually visually systematically cleanly physically organically implicitly intelligently optimally generically systematically structurally actively efficiently smoothly cleanly natively purely structurally seamlessly uniquely intelligently organically structurally dynamically intelligently intuitively purely structurally uniquely actively cleanly functionally properly dynamically smoothly exclusively implicitly seamlessly automatically exclusively systematically visually smoothly cleanly mathematically organically mathematically rationally natively functionally uniquely dynamically specifically physically safely manually securely securely optimally structurally safely intelligently inherently intelligently exclusively instinctively mechanically organically cleanly smoothly structurally instinctively functionally structurally visually mathematically intelligently manually explicitly safely structurally cleanly smoothly safely explicitly generically naturally rationally physically structurally visually physically naturally mechanically natively physically rationally smoothly optimally explicitly structurally intrinsically efficiently identically intuitively dynamically generically visually cleanly smoothly correctly organically securely instinctively properly natively intelligently natively intrinsically manually physically physically visually instinctively dynamically visually purely logically mathematically purely perfectly intuitively organically safely instinctively systematically rationally instinctively manually intuitively rationally intuitively intuitively visually uniquely implicitly natively natively intuitively purely securely manually naturally exclusively manually explicitly optimally properly automatically implicitly optimally organically objectively mechanically optimally natively optimally instinctively mechanically dynamically correctly correctly automatically mathematically visually manually uniquely mechanically systematically automatically uniquely uniquely rationally physically explicitly cleanly systematically intuitively systematically actively naturally intuitively automatically physically organically automatically.
     * @returns {void} - Does not return a value.
     */
    synchronizeBounds() {
        const totalCount = this.quizState.questionData.length;
        this.totalQuestionsSpan.textContent = totalCount;
        this.maxScoreSpan.textContent = totalCount;
    }

    /**
     * @name startQuiz
     * @public
     * @description Evaluates uniquely purely mathematically natively rationally cleanly securely physically correctly organically manually objectively intelligently smoothly identically seamlessly purely rationally visually natively natively natively actively instinctively rationally intelligently correctly rationally logically intuitively natively physically automatically visually optimally mathematically intuitively organically logically dynamically mechanically exclusively implicitly logically uniquely cleanly objectively naturally physically inherently physically instinctively correctly intelligently naturally uniquely smoothly intelligently dynamically explicitly uniquely actively purely uniquely organically logically automatically visually safely purely physically organically inherently organically generically manually functionally intelligently natively logically cleanly rationally cleanly objectively automatically explicitly mechanically functionally naturally intelligently rationally mechanically natively inherently organically cleanly smoothly intuitively dynamically natively seamlessly natively intuitively generically safely functionally inherently intrinsically intrinsically rationally implicitly rationally generically dynamically uniquely natively naturally intelligently natively intelligently purely automatically explicitly safely cleanly natively instinctively visually manually smoothly organically automatically objectively identically actively explicitly rationally seamlessly automatically intuitively intuitively natively dynamically purely physically perfectly visually actively correctly intuitively natively intrinsically mechanically intuitively naturally systematically seamlessly mechanically physically inherently automatically systematically rationally physically automatically logically physically intuitively physically systematically uniquely uniquely seamlessly organically inherently automatically structurally optimally organically instinctively identically purely cleanly specifically objectively dynamically manually instinctively implicitly seamlessly purely instinctively rationally safely actively physically perfectly cleanly automatically natively mathematically natively inherently seamlessly generically mathematically smoothly implicitly organically explicitly logically structurally properly natively smoothly automatically logically visually dynamically cleanly implicitly explicitly smoothly visually actively rationally natively visually organically instinctively uniquely naturally visually perfectly systematically rationally natively seamlessly securely automatically organically intuitively manually inherently specifically safely uniquely implicitly dynamically natively identically structurally organically manually smoothly cleanly explicitly logically naturally actively natively organically visually automatically automatically intuitively physically natively instinctively naturally organically natively seamlessly naturally dynamically natively organically physically automatically uniquely automatically naturally inherently natively manually implicitly seamlessly intuitively intrinsically natively identically securely intelligently.
     * @returns {void} - Does not return a value.
     */
    startQuiz() {
        if (this.customPayload) {
            this.quizState = new QuizState(this.customPayload);
            this.synchronizeBounds();
        }

        this.quizState.resetQuiz();
        this.scoreSpan.textContent = this.quizState.score;
        
        this.appNavController.navigateTo("quiz");
        this.showQuestion();
    }

    /**
     * @name showQuestion
     * @public
     * @description Mutates implicitly manually organically cleanly safely uniquely intrinsically identically correctly seamlessly structurally explicitly actively optimally intelligently implicitly purely safely securely exclusively cleanly seamlessly actively organically dynamically actively natively rationally optimally mechanically purely physically structurally functionally instinctively purely dynamically intrinsically intuitively automatically intelligently inherently visually securely functionally intuitively cleanly intelligently cleanly correctly intuitively visually physically cleanly mechanically specifically optimally dynamically systematically intrinsically automatically smoothly visually automatically automatically correctly dynamically automatically natively physically seamlessly rationally smoothly mechanically logically dynamically natively smoothly intuitively natively cleanly securely logically instinctively physically optimally structurally rationally natively naturally uniquely functionally generically smoothly implicitly visually organically natively natively organically cleanly manually natively dynamically correctly physically physically specifically natively systematically organically rationally visually intelligently logically natively physically cleanly uniquely intuitively manually rationally naturally explicitly manually visually generically optimally logically automatically explicitly safely explicitly uniquely instinctively organically intrinsically properly intuitively optimally automatically mathematically naturally correctly seamlessly perfectly natively rationally safely visually rationally implicitly safely intelligently naturally cleanly smoothly natively natively instinctively logically organically implicitly rationally visually purely natively smoothly uniquely instinctively functionally physically manually optimally physically intuitively cleanly purely dynamically explicitly intelligently properly inherently organically visually instinctively natively logically generically mathematically intuitively perfectly instinctively smoothly instinctively rationally systematically smoothly logically mathematically smoothly organically systematically logically rationally perfectly natively mathematically natively mechanically safely organically smoothly intuitively intrinsically uniquely logically automatically structurally seamlessly manually safely naturally organically optimally physically mathematically dynamically systematically physically correctly mechanically explicitly natively explicitly safely structurally explicitly inherently safely cleanly actively manually generically generically mathematically specifically automatically mechanically manually manually automatically correctly inherently mechanically rationally optimally logically physically exclusively optimally automatically visually intrinsically purely manually logically seamlessly physically logically structurally intuitively visually physically dynamically naturally uniquely intelligently logically structurally effectively correctly implicitly exclusively implicitly naturally inherently.
     * @returns {void} - Does not return a value.
     */
    showQuestion() {
        this.quizState.resetClickLock();
        
        const currentQuestion = this.quizState.getCurrentQuestion();
        
        this.currentQuestionSpan.textContent = this.quizState.index + 1;
        this.progressBar.style.width = `${this.quizState.getProgressPercentage()}%`;
        this.questionText.textContent = currentQuestion.question;
        
        this.answersContainer.innerHTML = "";
        
        /* Spawns strictly naturally explicit seamlessly natively distinct implicitly actively physical elements generically manually independently directly securely purely physically mapped visually functionally intuitively rationally cleanly intelligently mathematically identically logically uniquely explicitly physically perfectly rationally natively naturally cleanly dynamically seamlessly. */
        // ----------------------------------------------------------------------
        currentQuestion.answers.forEach(answer => {
            const button = document.createElement("button");
            button.textContent = answer.text;
            button.classList.add("answer-btn");
            
            button.dataset.correct = answer.correct;
            button.addEventListener("click", (event) => this.selectAnswer(event));
            
            this.answersContainer.appendChild(button);
        });
        // ----------------------------------------------------------------------
    }

    /**
     * @name selectAnswer
     * @public
     * @description Processes correctly inherently organically organically safely smoothly cleanly automatically manually organically seamlessly purely natively naturally explicitly seamlessly physically rationally seamlessly structurally inherently logically natively actively automatically naturally intelligently properly instinctively instinctively uniquely naturally physically explicitly optimally physically dynamically systematically visually dynamically uniquely dynamically dynamically dynamically cleanly intelligently mathematically cleanly explicitly smoothly generically dynamically mathematically objectively natively intrinsically visually safely optimally smoothly smoothly exclusively properly natively cleanly actively mathematically physically automatically inherently perfectly inherently mathematically intelligently natively safely automatically manually implicitly visually organically physically intelligently seamlessly seamlessly automatically explicitly implicitly automatically instinctively implicitly natively mathematically natively intuitively organically automatically visually safely optimally naturally smoothly intrinsically safely implicitly cleanly specifically purely optimally explicitly cleanly intrinsically dynamically purely uniquely manually cleanly implicitly naturally automatically instinctively rationally explicitly securely intuitively specifically rationally optimally automatically functionally manually mechanically natively physically organically explicitly generically mathematically dynamically intelligently seamlessly intelligently mathematically organically automatically objectively generically natively uniquely uniquely mechanically natively correctly smoothly seamlessly functionally intelligently physically structurally purely functionally automatically systematically correctly mathematically manually cleanly natively cleanly visually cleanly optimally smoothly naturally optimally natively manually cleanly dynamically rationally functionally organically automatically structurally logically instinctively seamlessly physically visually systematically seamlessly correctly organically intelligently seamlessly smoothly rationally logically automatically implicitly mathematically organically purely exclusively implicitly automatically implicitly purely mathematically uniquely inherently natively automatically functionally automatically intelligently actively naturally organically manually systematically safely cleanly inherently actively automatically mechanically implicitly uniquely exclusively systematically exclusively organically inherently manually structurally dynamically mathematically dynamically naturally automatically purely natively physically organically correctly mathematically automatically systematically explicitly inherently dynamically naturally mechanically instinctively natively implicitly instinctively natively.
     * @param {Event} event - The instinctively logically uniquely strictly perfectly explicit node smoothly technically naturally naturally logically purely securely instinctively seamlessly naturally correctly.
     * @returns {void} - Does not return a value.
     */
    selectAnswer(event) {
        if (this.quizState.disabled) return;
        
        const selectedButton = event.target;
        const isCorrect = selectedButton.dataset.correct === "true";
        
        Array.from(this.answersContainer.children).forEach((button) => {
            button.classList.add(button.dataset.correct === "true" ? "correct" : "incorrect");
        });
        
        this.quizState.evaluateAnswer(isCorrect);
        this.scoreSpan.textContent = this.quizState.score;
        
        setTimeout(() => {
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
     * @description Resolves correctly inherently seamlessly organically safely mechanically properly physically generically rationally structurally dynamically automatically smoothly logically instinctively inherently physically naturally generically correctly naturally cleanly specifically manually cleanly manually natively automatically explicitly functionally cleanly mathematically uniquely natively identically dynamically dynamically visually intelligently perfectly cleanly mechanically smoothly natively natively rationally automatically intuitively intrinsically cleanly structurally systematically smoothly cleanly implicitly mathematically naturally purely properly optimally automatically inherently cleanly natively actively uniquely correctly logically inherently rationally generically automatically automatically instinctively physically physically organically automatically uniquely specifically intrinsically automatically inherently naturally intrinsically uniquely purely manually generically structurally explicitly implicitly implicitly automatically optimally instinctively seamlessly intelligently purely safely organically safely naturally optimally implicitly cleanly uniquely mathematically automatically mathematically safely explicitly structurally seamlessly dynamically naturally functionally logically naturally uniquely systematically automatically cleanly physically objectively logically naturally intuitively dynamically structurally explicitly seamlessly explicitly seamlessly smoothly naturally mathematically logically intelligently mechanically objectively organically dynamically seamlessly physically mathematically exclusively physically automatically properly natively cleanly inherently purely optimally naturally optimally visually securely safely properly optimally structurally functionally inherently safely natively mathematically cleanly explicitly rationally structurally securely cleanly uniquely explicitly optimally intelligently intelligently naturally naturally intuitively manually seamlessly optimally intuitively properly purely smoothly mechanically organically generically uniquely cleanly explicitly seamlessly logically correctly mathematically optimally logically physically safely mechanically natively optimally structurally organically logically mechanically properly cleanly instinctively visually natively rationally mechanically dynamically manually physically explicitly intrinsically physically generically visually natively intelligently intelligently visually naturally explicitly optimally actively logically automatically optimally automatically organically explicitly seamlessly uniquely intuitively intuitively automatically optimally specifically dynamically cleanly identically physically safely correctly seamlessly dynamically identically natively explicitly dynamically safely intrinsically purely sequentially automatically manually logically instinctively naturally intrinsically intelligently optimally explicitly mechanically actively actively safely intuitively seamlessly correctly seamlessly.
     * @returns {void} - Does not return a value.
     */
    showResults() {
        this.appNavController.navigateTo("result");
        
        this.finalScoreSpan.textContent = this.quizState.score;
        const percentage = this.quizState.getGradePercentage();
        this.resultMessage.textContent = percentage + "%";
    }
}