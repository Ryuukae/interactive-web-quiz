import { createLogger } from "./logger.js";

const logger = createLogger("fileIO");

/**
 * Global utility encapsulating browser-native file generation and download triggers.
 * Agnostic to application state and physical DOM structures.
 *
 * @module fileIO
 * @version 1.6.0
 * @author Adam Ross DeStafeno
 * @typedef {import('../types.js').QuestionType} QuestionType
 * @typedef {import('../types.js').RawQuestionType} RawQuestionType
 * @typedef {import('../types.js').BuilderCardPrefillType} BuilderCardPrefillType
 */

/**
 * Converts a JavaScript payload into a formatted JSON file and triggers a client browser download globally.
 * @name exportJSON
 * @public
 * @param {QuestionType[]} payload - The compiled data logic to serialize cleanly.
 * @param {string} filename - The designated output file name strictly.
 * @returns {void} - Does not return a value.
 */
export function exportJSON(payload, filename = "custom_quiz.json") {
  logger.info("exportJSON called", { payload, filename });
  logger.debug("Serializing JSON payload for download", { filename });

  if (!payload || (Array.isArray(payload) && payload.length === 0)) {
    logger.warn("Export aborted because payload is empty", { filename });
    return;
  }

  logger.info("Export started", {
    filename,
    itemCount: Array.isArray(payload) ? payload.length : 1
  });

  /* Transforms the raw data into a transient Blob object and executes a hidden DOM click to force the OS download dialogue securely. */
  // ----------------------------------------------------------------------
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  logger.debug("Triggering browser download via temporary anchor", {
    filename,
    url
  });
  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  // ----------------------------------------------------------------------

  logger.info("Export completed successfully", { filename });
  logger.debug("JSON export blob revoked and cleaned up");
}

/**
 * Converts a JavaScript payload into a formatted QAD text file and triggers a client browser download globally.
 * @name exportQAD
 * @public
 * @param {BuilderCardPrefillType[]} payload - The compiled data logic to serialize cleanly.
 * @param {string} filename - The designated output file name strictly.
 * @returns {void} - Does not return a value.
 */
export function exportQAD(payload, filename = "custom_quiz.txt") {
  logger.info("exportQAD called", { payload, filename });
  logger.debug("Serializing QAD payload for download", { filename });

  if (!payload || !Array.isArray(payload) || payload.length === 0) {
    logger.warn("Export aborted because payload is empty or invalid", {
      filename
    });
    return;
  }

  logger.info("Export started", {
    filename,
    itemCount: payload.length
  });

  let qadText = "";
  payload.forEach((qObj) => {
    if (!qObj || !qObj.question) return;
    const qText = qObj.question
      .trim()
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');
    qadText += `Q="${qText}"\n`;

    if ("answers" in qObj && Array.isArray(qObj.answers)) {
      qObj.answers.forEach((aObj) => {
        if (!aObj || typeof aObj.text !== "string") return;
        const aText = aObj.text
          .trim()
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"');
        if (aObj.correct) {
          qadText += `A="${aText}"\n`;
        } else {
          qadText += `D="${aText}"\n`;
        }
      });
    } else if ("correct_answer" in qObj || "distractors" in qObj) {
      if (qObj.correct_answer) {
        const aText = qObj.correct_answer
          .trim()
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"');
        qadText += `A="${aText}"\n`;
      }
      if (Array.isArray(qObj.distractors)) {
        qObj.distractors.forEach((d) => {
          const dText = typeof d === "string" ? d : (d && d.text) || "";
          if (dText.trim()) {
            const escapedDistractor = dText
              .trim()
              .replace(/\\/g, "\\\\")
              .replace(/"/g, '\\"');
            qadText += `D="${escapedDistractor}"\n`;
          }
        });
      }
    }
    qadText += "\n";
  });

  /* Transforms the raw data into a transient Blob object and executes a hidden DOM click to force the OS download dialogue securely. */
  // ----------------------------------------------------------------------
  const blob = new Blob([qadText.trim()], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  logger.debug("Triggering browser download via temporary anchor", {
    filename,
    url
  });
  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  // ----------------------------------------------------------------------

  logger.info("Export completed successfully", { filename });
  logger.debug("QAD export blob revoked and cleaned up");
}

/**
 * Extracts text contents from a physical File object securely seamlessly.
 * @name readFile
 * @public
 * @param {File} file - The file object explicitly selected by the user.
 * @returns {Promise<string>} - Resolves seamlessly with the raw text payload.
 */
export function readFile(file) {
  logger.info("readFile called", {
    file,
    fileName: file ? file.name : null,
    size: file ? file.size : null
  });

  return new Promise((resolve, reject) => {
    logger.debug("readFile: PromiseExecutor initializing FileReader", {
      fileName: file.name
    });
    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      logger.info("readFile: onload completed successfully", {
        fileName: file.name,
        size: file.size,
        bytesLoaded: loadEvent.loaded
      });
      logger.debug("FileReader buffer resolved to text");
      if (!(loadEvent.target instanceof FileReader)) {
        resolve("");
        return;
      }
      resolve(String(loadEvent.target.result));
    };

    reader.onerror = () => {
      const error = new Error("Failed to read the provided file.");
      logger.error("readFile: onerror failed reading file", {
        fileName: file.name,
        error
      });
      reject(error);
    };

    logger.debug("readFile: starting readAsText execution", {
      fileName: file.name
    });
    reader.readAsText(file);
  });
}
