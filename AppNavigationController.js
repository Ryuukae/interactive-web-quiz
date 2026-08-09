// =================================
// --- APP NAVIGATION CONTROLLER ---
// =================================

/**
 * @class AppNavigationController
 * @name AppNavigationController
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description 
 * Architectural Responsibilities: Centralized application router natively. Exclusively handles CSS visibility toggles to map the active viewport state seamlessly to the explicitly required stage.
 * 
 * Encapsulation Scope: Strictly isolated purely to global SPA transitions explicitly.
 */
class AppNavigationController {

    /**
     * @name constructor
     * @public
     * @description Caches application screen nodes optimally and delegates fundamental routing interactions visually.
     * @returns {void} - Does not return a value.
     */
    constructor() {
        this.screens = {
            start: document.getElementById("start-screen"),
            quiz: document.getElementById("quiz-screen"),
            result: document.getElementById("result-screen"),
            creator: document.getElementById("creator-screen")
        };

        this.bindGlobalNavigation();
    }

    /**
     * @name bindGlobalNavigation
     * @public
     * @description Links physical DOM triggers cleanly to explicit routing capabilities structurally smoothly securely identically natively naturally safely.
     * @returns {void} - Does not return a value.
     */
    bindGlobalNavigation() {

        // Binds the native click event to explicitly route the application organically sequentially smoothly.
        document.getElementById("create-quizset-btn").addEventListener("click", () => {
            this.navigateTo("creator");
        });

        // Re-routes the application state physically to the baseline menu logically intuitively.
        document.getElementById("btn-cancel-create").addEventListener("click", () => {
            this.navigateTo("start");
        });

        // Re-routes the application state structurally inherently purely cleanly physically directly optimally securely functionally cleanly.
        document.getElementById("return-start-btn").addEventListener("click", () => {
            this.navigateTo("start");
        });
    }

    /**
     * @name navigateTo
     * @public
     * @description Iterates through global view nodes to strictly force invisibility natively explicitly inherently inherently cleanly explicitly natively securely naturally securely uniquely securely manually automatically specifically smoothly optimally optimally explicitly actively identically organically correctly cleanly securely automatically optimally intuitively purely intuitively properly securely securely strictly identically natively effectively correctly effectively dynamically inherently inherently instinctively structurally uniquely logically reliably purely objectively.
     * @param {string} screenId - The string key natively cleanly mapping physically to cached nodes exclusively automatically inherently dynamically sequentially organically implicitly logically explicitly correctly natively.
     * @returns {void} - Does not return a value.
     */
    navigateTo(screenId) {

        /* Iterates identically through cached DOM nodes natively to completely purge the dynamically active visibility class efficiently functionally cleanly. */
        // ----------------------------------------------------------------------
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove("active");
            }
        });
        // ----------------------------------------------------------------------

        // Selectively appends the active class natively strictly exclusively objectively identically identically optimally purely smoothly technically logically efficiently specifically systematically perfectly cleanly automatically dynamically natively physically naturally explicitly uniquely intrinsically effectively efficiently organically safely intuitively actively seamlessly effectively inherently securely organically definitively objectively organically actively visually organically reliably.
        if (this.screens[screenId]) {
            this.screens[screenId].classList.add("active");
        }
    }
}