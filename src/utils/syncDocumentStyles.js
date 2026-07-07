const CLONE_MARK = 'data-example-driver-cloned';
const SOURCE_MARK = 'data-example-driver-style-source';

const getStyleSourceId = (node, index) => {
    if (node.href) {
        return 'link:' + node.href;
    }
    if (node.id) {
        return 'style#' + node.id;
    }
    const cssHash = node.getAttribute && node.getAttribute('data-css-hash');
    if (cssHash) {
        return 'style:hash:' + cssHash;
    }
    const rcOrder = node.getAttribute && node.getAttribute('data-rc-order');
    if (rcOrder) {
        const rcPriority = node.getAttribute('data-rc-priority') || '';
        return 'style:rc:' + rcOrder + ':' + rcPriority + ':' + index;
    }
    return 'style:' + index;
};

const upsertClone = (sourceNode, sourceId, targetDoc, existingClone) => {
    if (existingClone) {
        if (sourceNode.tagName === 'STYLE' && existingClone.textContent !== sourceNode.textContent) {
            existingClone.textContent = sourceNode.textContent;
        }
        return existingClone;
    }
    const clone = sourceNode.cloneNode(true);
    clone.setAttribute(CLONE_MARK, 'true');
    clone.setAttribute(SOURCE_MARK, sourceId);
    targetDoc.head.appendChild(clone);
    return clone;
};

export const syncDocumentStyles = (targetDoc) => {
    if (!targetDoc || !targetDoc.head || typeof document === 'undefined') {
        return;
    }

    const cloneMap = new Map(
        Array.from(targetDoc.head.querySelectorAll('[' + SOURCE_MARK + ']'))
            .map(node => [node.getAttribute(SOURCE_MARK), node])
    );

    const sourceNodes = document.head.querySelectorAll('link[rel="stylesheet"], style');
    sourceNodes.forEach((node, index) => {
        const sourceId = getStyleSourceId(node, index);
        upsertClone(node, sourceId, targetDoc, cloneMap.get(sourceId));
        cloneMap.delete(sourceId);
    });
};

export const watchDocumentStyles = (targetDoc) => {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
        return null;
    }
    const observer = new MutationObserver(() => {
        syncDocumentStyles(targetDoc);
    });
    observer.observe(document.head, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['href', 'media', 'disabled']
    });
    return observer;
};

export const __private__ = {
    CLONE_MARK,
    SOURCE_MARK,
    getStyleSourceId
};
