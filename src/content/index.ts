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

// Load snippets and autoDetect from Chrome storage
chrome.storage.local.get(
  ["snippets", "autoDetect"],
  (result: { snippets?: Snippet[]; autoDetect?: boolean }) => {
    if (result.snippets) {
      snippets = result.snippets;
    }
    if (result.autoDetect !== undefined) {
      autoDetect = result.autoDetect;
    }
  }
);

// Function to handle text replacement based on snippets
const handleTextReplacement = (element: HTMLElement) => {
  let text =
    element.innerText ||
    (element as HTMLInputElement | HTMLTextAreaElement).value;

  snippets.forEach((snippet) => {
    const regex = new RegExp(`\\b${snippet.command}\\b`, "g");
    if (regex.test(text)) {
      const updatedText = text.replace(regex, snippet.content);

      // Update content and apply animation
      if (element.isContentEditable) {
        element.innerText = updatedText;
      } else if (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA"
      ) {
        (element as HTMLInputElement | HTMLTextAreaElement).value = updatedText;
      }

      // Apply animation class
      element.classList.add("snippet-replaced");

      // Remove animation class after animation completes
      setTimeout(() => {
        element.classList.remove("snippet-replaced");
      }, 500); // 500ms matches the animation duration
    }
  });
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
    const shadowInput = element.shadowRoot.querySelector(
      "input, textarea, [contenteditable='true']"
    );
    if (shadowInput) {
      handleTextReplacement(shadowInput as HTMLElement);
    }
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

// Listen for storage changes (in case snippets or autoDetect are updated while the content script is running)
chrome.storage.onChanged.addListener(
  (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.snippets) {
      snippets = changes.snippets.newValue as Snippet[];
    }
    if (changes.autoDetect) {
      autoDetect = changes.autoDetect.newValue as boolean;
    }
  }
);
