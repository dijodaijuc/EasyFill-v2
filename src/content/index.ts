// CSS for the animation
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .snippet-replaced {
    animation: fadeIn 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);

// Define types for the snippet
interface Snippet {
  id: string;
  command: string;
  content: string;
}

// Initialize state variables
let snippets: Snippet[] = [];
let autoDetect: boolean = false;
let triggerSymbol: string = "-";

// Load snippets, autoDetect, and triggerSymbol from Chrome storage
chrome.storage.local.get(
  ["snippets", "autoDetect", "triggerSymbol"],
  (result: { snippets?: Snippet[]; autoDetect?: boolean; triggerSymbol?: string }) => {
    if (result.snippets) {
      snippets = result.snippets;
    }
    if (result.autoDetect !== undefined) {
      autoDetect = result.autoDetect;
    }
    if (result.triggerSymbol) {
      triggerSymbol = result.triggerSymbol;
    }
  }
);

// Function to escape special characters in the trigger symbol for use in regex
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const replaceVariables = async (content: string): Promise<string> => {
  const variableRegex = /{(\w+)}/g;
  let match;
  let replacedContent = content;

  while ((match = variableRegex.exec(content)) !== null) {
    const variable = match[1];
    let replacement = '';

    switch (variable.toLowerCase()) {
      case 'date':
        replacement = new Date().toLocaleDateString();
        break;
      case 'time':
        replacement = new Date().toLocaleTimeString();
        break;
      default:
        // For custom variables, prompt the user for input
        replacement = await new Promise<string>((resolve) => {
          chrome.runtime.sendMessage(
            { action: 'promptForVariable', variable },
            (response) => {
              resolve(response || `{${variable}}`);
            }
          );
        });
    }

    replacedContent = replacedContent.replace(`{${variable}}`, replacement);
  }

  return replacedContent;
};


// Function to handle text replacement based on snippets
const handleTextReplacement = async (element: HTMLElement) => {
  const text =
    element.innerText ||
    (element as HTMLInputElement | HTMLTextAreaElement).value;

  for (const snippet of snippets) {
    const escapedTrigger = escapeRegExp(triggerSymbol);
    const regex = new RegExp(`${escapedTrigger}${snippet.command}\\b`, "g");
    if (regex.test(text)) {
      const replacedContent = await replaceVariables(snippet.content);
      const updatedText = text.replace(regex, replacedContent);

      // Update content and apply animation
      if (element.isContentEditable) {
        element.innerText = updatedText;
        // Set cursor position for contenteditable elements
        const range = document.createRange();
        const sel = window.getSelection();
        if (element.firstChild) {
          const newPosition = Math.min(updatedText.length, element.firstChild.textContent?.length || 0);
          range.setStart(element.firstChild, newPosition);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      } else if (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA"
      ) {
        (element as HTMLInputElement | HTMLTextAreaElement).value = updatedText;
        // Set cursor position for input and textarea elements
        const newPosition = Math.min(updatedText.length, (element as HTMLInputElement | HTMLTextAreaElement).value.length);
        (element as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(newPosition, newPosition);
      }

      // Apply animation class
      element.classList.add("snippet-replaced");

      // Remove animation class after animation completes
      setTimeout(() => {
        element.classList.remove("snippet-replaced");
      }, 500); // 500ms matches the animation duration

      // Ensure the element is focused
      element.focus();

      // Break the loop after replacing the first matching snippet
      break;
    }
  }
};

// Listen for changes in input or textareas or contenteditable elements
document.addEventListener("input", (event: Event) => {
  if (!autoDetect) return;

  const target = event.target as HTMLElement;

  // Handle textareas, input elements, and contenteditable elements
  if (
    target.tagName === "TEXTAREA" ||
    target.tagName === "INPUT" ||
    target.isContentEditable
  ) {
    handleTextReplacement(target);
  }
});

// Traverse Shadow DOM to find relevant input fields
const traverseShadowDOM = (element: HTMLElement | ShadowRoot) => {
  if (element instanceof HTMLElement && element.shadowRoot) {
    // Find all potential input fields within the Shadow DOM
    const shadowInputs = element.shadowRoot.querySelectorAll(
      "input, textarea, [contenteditable='true']"
    );
    shadowInputs.forEach((shadowInput) => {
      handleTextReplacement(shadowInput as HTMLElement);
    });
  }
};

// MutationObserver to detect changes in dynamic web pages
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // Handle added nodes (e.g., new inputs added to the page)
    mutation.addedNodes.forEach((node) => {
      if (node instanceof HTMLElement) {
        if (
          node.tagName === "TEXTAREA" ||
          node.tagName === "INPUT" ||
          node.isContentEditable
        ) {
          handleTextReplacement(node);
        }
        traverseShadowDOM(node);
      }
    });

    // Handle changes to existing nodes (e.g., contenteditable changes)
    if (mutation.type === "characterData" || mutation.type === "childList") {
      const target = mutation.target as HTMLElement;
      if (target.isContentEditable) {
        handleTextReplacement(target);
      }
    }
  });
});

// Start observing the document for mutations (useful for dynamically loaded content)
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});

// Listen for storage changes (in case snippets, autoDetect, or triggerSymbol are updated while the content script is running)
chrome.storage.onChanged.addListener(
  (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.snippets) {
      snippets = changes.snippets.newValue as Snippet[];
    }
    if (changes.autoDetect) {
      autoDetect = changes.autoDetect.newValue as boolean;
    }
    if (changes.triggerSymbol) {
      triggerSymbol = changes.triggerSymbol.newValue as string;
    }
  }
);