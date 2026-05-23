"use client";

export type RichEditorSelection = {
  selectionStart: number;
  selectionEnd: number;
};

type DomPosition = {
  container: Node;
  offset: number;
};

function isElementNode(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE;
}

function isGhostElement(node: Node) {
  return isElementNode(node) && node.classList.contains("md-token--ghost");
}

function shouldJoinChildrenWithLineBreaks(node: Node) {
  if (!isElementNode(node)) {
    return false;
  }

  if (node.dataset.editorSurface === "true" || node.classList.contains("md-block")) {
    return true;
  }

  if (node.classList.contains("md-line") || node.classList.contains("md-table-row")) {
    return false;
  }

  return node.tagName === "DIV" || node.tagName === "P" || node.tagName === "LI";
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.replace(/\u00A0/g, " ") ?? "";
  }

  if (!isElementNode(node) || isGhostElement(node)) {
    return "";
  }

  if (node.tagName === "BR") {
    return "\n";
  }

  const pieces = Array.from(node.childNodes, (child) => serializeNode(child));

  return shouldJoinChildrenWithLineBreaks(node) ? pieces.join("\n") : pieces.join("");
}

function getNodeTextLength(node: Node) {
  return serializeNode(node).length;
}

function measureOffsetFromNode(node: Node, targetNode: Node, targetOffset: number): number | null {
  if (node === targetNode) {
    if (node.nodeType === Node.TEXT_NODE) {
      return Math.min(targetOffset, node.textContent?.length ?? 0);
    }

    if (!isElementNode(node)) {
      return 0;
    }

    const children = Array.from(node.childNodes);
    const boundedOffset = Math.min(targetOffset, children.length);
    let accumulatedLength = 0;

    for (let index = 0; index < boundedOffset; index += 1) {
      accumulatedLength += getNodeTextLength(children[index]);

      if (shouldJoinChildrenWithLineBreaks(node) && index < children.length - 1) {
        accumulatedLength += 1;
      }
    }

    return accumulatedLength;
  }

  if (node.nodeType === Node.TEXT_NODE || !isElementNode(node) || isGhostElement(node)) {
    return null;
  }

  const children = Array.from(node.childNodes);
  let accumulatedLength = 0;

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    const childOffset = measureOffsetFromNode(child, targetNode, targetOffset);

    if (childOffset !== null) {
      return accumulatedLength + childOffset;
    }

    accumulatedLength += getNodeTextLength(child);

    if (shouldJoinChildrenWithLineBreaks(node) && index < children.length - 1) {
      accumulatedLength += 1;
    }
  }

  return null;
}

function findFirstPosition(node: Node): DomPosition {
  if (node.nodeType === Node.TEXT_NODE) {
    return { container: node, offset: 0 };
  }

  if (!isElementNode(node) || isGhostElement(node)) {
    return { container: node, offset: 0 };
  }

  const firstChild = node.childNodes[0];
  return firstChild ? findFirstPosition(firstChild) : { container: node, offset: 0 };
}

function findLastPosition(node: Node): DomPosition {
  if (node.nodeType === Node.TEXT_NODE) {
    return { container: node, offset: node.textContent?.length ?? 0 };
  }

  if (!isElementNode(node) || isGhostElement(node)) {
    if (node.parentNode && isElementNode(node.parentNode)) {
      return {
        container: node.parentNode,
        offset: Array.from(node.parentNode.childNodes).findIndex((child) => child === node)
      };
    }

    return { container: node, offset: 0 };
  }

  const lastChild = node.childNodes[node.childNodes.length - 1];
  return lastChild ? findLastPosition(lastChild) : { container: node, offset: node.childNodes.length };
}

function locatePosition(node: Node, remainingOffset: number): DomPosition {
  if (node.nodeType === Node.TEXT_NODE) {
    return {
      container: node,
      offset: Math.min(remainingOffset, node.textContent?.length ?? 0)
    };
  }

  if (!isElementNode(node) || isGhostElement(node)) {
    return { container: node, offset: 0 };
  }

  const children = Array.from(node.childNodes);

  if (children.length === 0) {
    return { container: node, offset: 0 };
  }

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    const childLength = getNodeTextLength(child);

    if (remainingOffset <= childLength) {
      return locatePosition(child, remainingOffset);
    }

    remainingOffset -= childLength;

    if (shouldJoinChildrenWithLineBreaks(node) && index < children.length - 1) {
      if (remainingOffset <= 1) {
        return findFirstPosition(children[index + 1]);
      }

      remainingOffset -= 1;
    }
  }

  return findLastPosition(children[children.length - 1]);
}

export function serializeRichEditorSurface(surface: HTMLElement) {
  return serializeNode(surface);
}

export function getRichEditorSelection(surface: HTMLElement): RichEditorSelection | null {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);

  if (!surface.contains(range.startContainer) || !surface.contains(range.endContainer)) {
    return null;
  }

  const selectionStart = measureOffsetFromNode(surface, range.startContainer, range.startOffset);
  const selectionEnd = measureOffsetFromNode(surface, range.endContainer, range.endOffset);

  if (selectionStart === null || selectionEnd === null) {
    return null;
  }

  return {
    selectionStart: Math.min(selectionStart, selectionEnd),
    selectionEnd: Math.max(selectionStart, selectionEnd)
  };
}

export function restoreRichEditorSelection(surface: HTMLElement, selectionStart: number, selectionEnd: number) {
  const selection = window.getSelection();

  if (!selection) {
    return;
  }

  const maxOffset = serializeRichEditorSurface(surface).length;
  const safeStart = Math.min(Math.max(selectionStart, 0), maxOffset);
  const safeEnd = Math.min(Math.max(selectionEnd, 0), maxOffset);
  const startPosition = locatePosition(surface, safeStart);
  const endPosition = locatePosition(surface, safeEnd);
  const range = document.createRange();

  range.setStart(startPosition.container, startPosition.offset);
  range.setEnd(endPosition.container, endPosition.offset);

  selection.removeAllRanges();
  selection.addRange(range);
}
