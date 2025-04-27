document.addEventListener("DOMContentLoaded", () => {
  const inputText = document.getElementById("inputText");
  const checkButton = document.getElementById("checkButton");
  const resultDiv = document.getElementById("result");

  checkButton.addEventListener("click", () => {
    const text = inputText.value.trim();
    if (text.length === 0) {
      resultDiv.innerText = "Please input some text.";
      return;
    }

    const fakeEmailData = {
      subject: "",
      sender: "",
      body: text
    };

    mockModelAPI(fakeEmailData).then(result => {
      resultDiv.innerText = `Prediction: ${result.prediction >=.5 ? 'Scam' : "Safe"} (Confidence: ${result.prediction})`;
    });
  });
});

async function mockModelAPI(emailData) {
  const text = (emailData.subject + " " + emailData.body).toLowerCase();
  let prediction = Math.random();;

  return {prediction};
}