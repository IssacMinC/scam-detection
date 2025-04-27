chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EMAIL_DATA") {
    console.log("Background received email data", message.data);
    checkForScam(message.data).then((result) => {
      chrome.storage.local.set({emailScanResult: result});
      sendResponse(result);
    });
    return true;
  }
});

async function checkForScam(emailData) {
  const result = await mockModelAPI(emailData);
  return result;
}

async function mockModelAPI(emailData) {
  const text = (emailData.subject + " " + emailData.body).toLowerCase();
  let prediction = Math.random();

  return {prediction};
}