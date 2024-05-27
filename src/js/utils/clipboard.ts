type ElementType =
    | { element: HTMLInputElement | HTMLTextAreaElement; isTextInput: true }
    | { element: HTMLElement; isTextInput: false };

function modernClipboardCopy({ element, isTextInput }: ElementType) {
    const blob = isTextInput
        ? new Blob([element.value], { type: "text/plain" })
        : new Blob([element.innerHTML], { type: "text/html" });
    const data = [new ClipboardItem({ [blob.type]: blob })];
    return navigator.clipboard.write(data);
}

function fallbackClipboardCopy({ element, isTextInput }: ElementType) {
    if (isTextInput) {
        element.focus();
        element.select();
        const didCopy = document.execCommand("copy");
        element.setSelectionRange(0, 0);
        return didCopy;
    }

    const selection = window.getSelection();

    if (!selection) {
        return false;
    }

    selection.removeAllRanges();
    selection.selectAllChildren(element);
    const didCopy = document.execCommand("copy");
    selection.removeAllRanges();
    if (element.tabIndex >= 0) {
        element.focus();
    }
    console.log("HTML", { didCopy });
    return didCopy;
}

/**
 * Returns true if data was successfully copied to the clipboard.
 */
export async function copyElementContentsToClipboard(
    element: HTMLElement
): Promise<boolean> {
    const elementType: ElementType =
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
            ? { element, isTextInput: true }
            : { element, isTextInput: false };

    try {
        if (window.ClipboardItem) {
            await modernClipboardCopy(elementType);
            return true;
        } else {
            return fallbackClipboardCopy(elementType);
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}
