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
        if (response && response.prediction) {
          updateScamBar(response.prediction);
        }
      });

    }, 500); 
  }

  function updateScamBar(prediction) {
      const bar = document.getElementById("scam-progress-bar");
      if (!bar) return;
    
      // Clamp value between 0 and 1
      const percentage = prediction * 100;
      bar.style.width = percentage + "%";
    
      // Color scale:
      // Green: 0–0.33, Yellow: 0.34–0.66, Red: 0.67–1
      let color = "#4caf50"; // Green
      if (prediction > 0.66) {
        color = "#f44336"; // Red
      } else if (prediction > 0.33) {
        color = "#ff9800"; // Orange
      }
      bar.style.background = color;
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

  const observer2 = new MutationObserver(() => {
    const subjectElement = document.querySelector("h2.hP");
  
    if (subjectElement && !document.getElementById("scam-progress-wrapper")) {
      // Create wrapper for label + bar
      const wrapper = document.createElement("div");
      wrapper.id = "scam-progress-wrapper";
      wrapper.style.marginTop = "12px";
      wrapper.style.fontFamily = "Arial, sans-serif";
  
      // Create label
      const label = document.createElement("div");
      label.textContent = "Scam Likelihood";
      label.style.fontSize = "14px";
      label.style.fontWeight = "bold";
      label.style.marginBottom = "4px";
  
      // Create container for progress bar
      const barContainer = document.createElement("div");
      barContainer.style.width = "100%";
      barContainer.style.height = "10px";
      barContainer.style.background = "#ccc";
      barContainer.style.borderRadius = "5px";
      barContainer.style.overflow = "hidden";
  
      // Create progress bar
      const bar = document.createElement("div");
      bar.id = "scam-progress-bar";
      bar.style.width = "0%";  // Set dynamically later
      bar.style.height = "100%";
      bar.style.background = "#f44336"; // red
      bar.style.transition = "width 0.5s";
  
      // Assemble
      barContainer.appendChild(bar);
      wrapper.appendChild(label);
      wrapper.appendChild(barContainer);
  
      // Inject below subject
      subjectElement.parentNode.insertBefore(wrapper, subjectElement.nextSibling);
  
    }
  });
  
  observer2.observe(document.body, { childList: true, subtree: true });

  // First initial load
  startMonitoringEmail();
})();