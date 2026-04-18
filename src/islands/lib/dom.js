import { RuiInvariantError } from "./errors.js";

export function ensureHostElement(host) {
  if (!(host instanceof HTMLElement)) {
    throw new RuiInvariantError("Expected host element to be an HTMLElement.", {
      code: "DOM_INVALID_TYPE",
    });
  }

  return host;
}

export function replaceElementWithHost(legacyElement, host) {
  if (!(legacyElement instanceof HTMLElement)) {
    throw new RuiInvariantError(
      "Expected legacy element to be an HTMLElement.",
      { code: "DOM_INVALID_TYPE" },
    );
  }
  if (!(host instanceof HTMLElement)) {
    throw new RuiInvariantError("Expected host element to be an HTMLElement.", {
      code: "DOM_INVALID_TYPE",
    });
  }

  const parentNode = legacyElement.parentNode;
  if (!parentNode) {
    throw new RuiInvariantError(
      "Expected legacy element to have a parent node.",
      { code: "DOM_MISSING" },
    );
  }

  parentNode.replaceChild(host, legacyElement);
}
