// reciving msg from bkg.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message.msg);
  sendResponse({message : "Response from content script"})
});

// sending msg to bkg.js

chrome.runtime.sendMessage({ message: "messageFromContentScript" }, function (response) {
console.log(response.message);
})



/*
// content.js foauto fill 

// Listen for a message from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'autoFillForm') {
    autoFillForm();
  }
});

// Implement the auto-fill function
function autoFillForm() {
  const formData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.com'
  };

  for (let field in formData) {
    const inputField = document.getElementById(field);
    if (inputField) {
      inputField.value = formData[field];
    }
  }
}
 */