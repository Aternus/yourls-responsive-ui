/**
 * Error for invariant violations across RUI islands.
 *
 * Canonical codes:
 * - DOM_MISSING: required DOM node/relationship is absent.
 * - DOM_INVALID_TYPE: DOM node exists but has unexpected runtime type.
 * - DATA_MISSING: required backend-provided data is absent.
 * - DATA_INVALID: backend-provided data has unexpected shape/type.
 */
export class RuiInvariantError extends Error {
  /**
   * @param {string} message
   * @param {{ code?: string }} [meta]
   */
  constructor(message, meta = {}) {
    const codePrefix = meta.code ? `${meta.code}: ` : "";

    super(`[rui] ${codePrefix}${message}`);

    this.name = "RuiInvariantError";
    this.code = meta.code ?? null;
  }
}
