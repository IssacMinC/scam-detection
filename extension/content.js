(function() {
  console.log("Email Scam Detector Content Script Loaded");

  let lastScannedEmail = "";
  let lastSubjectText = "";
  let stabilityTimer = null;
  let stabilityCheckTimer = null;

  function startMonitoringEmail() {
    if (stabilityTimer) {
      clearTimeout(stabilityTimer);
    }

    if (stabilityCheckTimer) {
      clearInterval(stabilityCheckTimer);
    }

    // Monitor subject text stability
    stabilityCheckTimer = setInterval(() => {
      const subjectElement = document.querySelector('h2.hP');
      const senderElement = document.querySelector('span.gD');

      if (!subjectElement || !senderElement) {
        return; // still loading
      }

      const currentSubjectText = subjectElement.innerText;
      const currentSenderText = senderElement.innerText;
      const currentEmailId = currentSubjectText + currentSenderText;

      if (currentSubjectText !== lastSubjectText) {
        console.log("Subject text changing...");
        lastSubjectText = currentSubjectText;
        return;
      }

      clearInterval(stabilityCheckTimer);

      if (currentEmailId === lastScannedEmail) {
        console.log("Already scanned this email.");
        return;
      }

      console.log("Subject stabilized. Scanning...");
      lastScannedEmail = currentEmailId;

      const emailData = {
        subject: subjectElement.innerText,
        sender: senderElement.innerText,
        body: document.body.innerText
      };

      chrome.runtime.sendMessage({type: "EMAIL_DATA", data: emailData}, (response) => {
        console.log("Got response back:", response);
        if (response && response.prediction && response.prediction >= .5) {
          injectWarningIcon(subjectElement, response.prediction);
        }
      });

    }, 500); 
  }

  function injectWarningIcon(subjectElement, predictionType) {
    if (!subjectElement.querySelector('span.scam-warning')) {
      const warning = document.createElement('span');
      warning.className = 'scam-warning';
      warning.innerText = ' ⚠️';
      warning.style.marginLeft = '8px';
      warning.title = `Warning: ${predictionType} detected`;
      subjectElement.appendChild(warning);
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        startMonitoringEmail(); 
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // First initial load
  startMonitoringEmail();
})();