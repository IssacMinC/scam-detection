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
  const scam = emailData.subject + " " + emailData.body
  const result = await modelAPI(scam);
  console.log(result)
  return result;
}

async function modelAPI(emailData) {
  try {
    const response = await fetch("http://localhost:5000/api/classify_scam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scam: emailData, model: 0 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Network response was not OK: " + errorText);
    }

    const prediction = await response.json();
    return prediction;

  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}