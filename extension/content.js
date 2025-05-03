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

    stabilityCheckTimer = setInterval(() => {
      const subjectElement = document.querySelector('h2.hP');
      const senderElement = document.querySelector('span.gD');

      if (!subjectElement || !senderElement) {
        return; 
      }

      const currentSubjectText = subjectElement.innerText;
      const currentSenderText = senderElement.innerText;
      const currentEmailId = currentSubjectText + currentSenderText;

      if (currentSubjectText !== lastSubjectText) {
        lastSubjectText = currentSubjectText;
        return;
      }

      clearInterval(stabilityCheckTimer);

      if (currentEmailId === lastScannedEmail) {
        return;
      }

      lastScannedEmail = currentEmailId;

      const emailData = {
        subject: subjectElement.innerText,
        sender: senderElement.innerText,
        body: document.body.innerText
      };

      chrome.runtime.sendMessage({type: "EMAIL_DATA", data: emailData}, (response) => {
        if (response && response.spam_score) {
          updateScamBar(response.spam_score);
        }
      });

    }, 500); 
  }

  function updateScamBar(prediction) {
      const bar = document.getElementById("scam-progress-bar");
      if (!bar) return;
    
      const percentage = prediction * 100;
      bar.style.width = percentage + "%";
    

      let color = "#4caf50"; 
      if (prediction > 0.66) {
        color = "#f44336"; // Red
      } else if (prediction > 0.33) {
        color = "#ff9800";
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
      const wrapper = document.createElement("div");
      wrapper.id = "scam-progress-wrapper";
      wrapper.style.marginTop = "12px";
      wrapper.style.fontFamily = "Arial, sans-serif";
  

      const label = document.createElement("div");
      label.textContent = "Scam Likelihood";
      label.style.fontSize = "14px";
      label.style.fontWeight = "bold";
      label.style.marginBottom = "4px";
  
      const barContainer = document.createElement("div");
      barContainer.style.width = "100%";
      barContainer.style.height = "10px";
      barContainer.style.background = "#ccc";
      barContainer.style.borderRadius = "5px";
      barContainer.style.overflow = "hidden";
  
      const bar = document.createElement("div");
      bar.id = "scam-progress-bar";
      bar.style.width = "0%"; 
      bar.style.height = "100%";
      bar.style.background = "#f44336"; 
      bar.style.transition = "width 0.5s";
  
      barContainer.appendChild(bar);
      wrapper.appendChild(label);
      wrapper.appendChild(barContainer);
  
      subjectElement.parentNode.insertBefore(wrapper, subjectElement.nextSibling);
  
    }
  });
  
  observer2.observe(document.body, { childList: true, subtree: true });

  startMonitoringEmail();
})();