chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'promptForVariable') {
    const userInput = prompt(`Please enter a value for ${request.variable}:`);
    sendResponse(userInput);
  }
  return true; // Indicates that the response will be sent asynchronously
});