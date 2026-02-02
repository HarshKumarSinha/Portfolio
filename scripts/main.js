// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Simple Intersection Observer to trigger animations on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => observer.observe(el));

// Lenis Smooth Scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: "vertical",
  gestureDirection: "vertical",
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
});

// Handle anchor links for Lenis
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    lenis.scrollTo(this.getAttribute("href"));
  });
});

const timelineSection = document.querySelector(".timeline-section");
const timelineContainer = document.querySelector(".timeline-container");

// Use Lenis scroll event to drive the animation
lenis.on("scroll", (e) => {
  if (timelineSection && timelineContainer) {
    const rect = timelineContainer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Start filling when the top of the container hits the middle of the screen
    const startOffset = windowHeight / 2;

    // Calculate progress based on position relative to viewport
    let progress = (startOffset - rect.top) / rect.height;

    // Clamp between 0 and 1
    progress = Math.max(0, Math.min(1, progress));

    timelineContainer.style.setProperty("--line-height", `${progress * 100}%`);
  }
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

let pdfDoc = null;
let pageNum = 1;
let canvas = document.getElementById("resumeCanvas");
let ctx = canvas.getContext("2d");
let isMobileRendered = false;

function openResume(event) {
  event.preventDefault();

  const modal = document.getElementById("resumeModal");
  const frame = document.getElementById("resumeFrame");
  const mobileContainer = document.getElementById("mobileResumeContainer");
  const isMobile = window.innerWidth <= 768;

  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scrolling

  if (isMobile) {
    // Mobile: Show Canvas, Hide Iframe
    frame.style.display = "none";
    mobileContainer.style.display = "block";

    // Render PDF only if not already rendered
    if (!isMobileRendered) {
      renderMobilePDF("document/Harsh_Kumar_Sinha_Resume.pdf");
    }
  } else {
    // Desktop: Show Iframe, Hide Canvas
    mobileContainer.style.display = "none";
    frame.style.display = "block";

    // Set the PDF source if it's not already set
    if (!frame.src || frame.src === window.location.href) {
      frame.src = "document/Harsh_Kumar_Sinha_Resume.pdf#toolbar=0&view=FitH";
    }
  }
}

function renderMobilePDF(url) {
  const loadingTask = pdfjsLib.getDocument(url);
  loadingTask.promise.then(
    function (pdf) {
      pdfDoc = pdf;
      pdf.getPage(1).then(function (page) {
        const mobileContainer = document.getElementById(
          "mobileResumeContainer",
        );
        const viewportOriginal = page.getViewport({
          scale: 1,
        });

        // Calculate visual scale to fit container width
        const containerWidth = mobileContainer.clientWidth || window.innerWidth;
        const visualScale = containerWidth / viewportOriginal.width;

        // Fix blurry text: Scale up for high-DPI (Retina) screens
        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({
          scale: visualScale * dpr,
        });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Scale back down visually using CSS
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        // Ensure context is scaled? No, PDF.js viewport handles the transform if we pass it.

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
          isMobileRendered = true;
        });
      });
    },
    function (reason) {
      // PDF loading error
      console.error(reason);
    },
  );
}

function closeResume(event) {
  if (event) event.preventDefault();
  const modal = document.getElementById("resumeModal");
  modal.classList.remove("active");
  document.body.style.overflow = ""; // Restore scrolling
}

function sendMail(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  // Basic Validation
  if (!name || !email || !subject || !message) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "Please fill in all fields.",
      showConfirmButton: false,
      timer: 3000,
      background: "#1f1f1f",
      color: "#ffffff",
    });
    return;
  }

  // Email Format Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "Please enter a valid email address.",
      showConfirmButton: false,
      timer: 3000,
      background: "#1f1f1f",
      color: "#ffffff",
    });
    return;
  }

  const btn = document.querySelector(".btn-primary");
  const originalText = btn.innerText;
  btn.innerText = "Sending...";

  const params = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    title: document.getElementById("subject").value,
    message: document.getElementById("message").value,
    time: new Date().toLocaleString(),
  };

  const serviceID = "service_nqhm14v";
  const templateID = "template_zh2dwoo";

  emailjs
    .send(serviceID, templateID, params)
    .then((res) => {
      document.getElementById("name").value = "";
      document.getElementById("email").value = "";
      document.getElementById("subject").value = "";
      document.getElementById("message").value = "";
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Message Sent Successfully!",
        showConfirmButton: false,
        timer: 3000,
        background: "#1f1f1f",
        color: "#ffffff",
      });
      btn.innerText = originalText;
    })
    .catch((err) => {
      console.error(err);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Failed to send message.",
        showConfirmButton: false,
        timer: 3000,
        background: "#1f1f1f",
        color: "#ffffff",
      });
      btn.innerText = originalText;
    });
}

// Chatbot Logic
const chatbotWidget = document.getElementById("chatbotWidget");
const chatInput = document.getElementById("chatInput");
const chatbotBody = document.getElementById("chatbotBody");
const typingIndicator = document.getElementById("typingIndicator");

// Knowledge Base powered by the portfolio content
const knowledgeBase = {
  greetings: [
    "Hi there! How can I help you?",
    "Hello! improved I'm ready to answer your questions about Harsh.",
    "Greetings! Ask me anything about Harsh's work.",
  ],
  about:
    "Harsh Sinha is a Computer Science Graduate and Junior Software Analyst at Enaiya Information Technology. He specializes in building modern web applications and enterprise SharePoint solutions, bridging the gap between backend logic and frontend design.",
  experience:
    "<b>Professional Experience:</b><br>• <b>Junior Software Analyst</b> @ Enaiya Information Technology (Aug 2025 - Present): Focuses on SharePoint Online, custom SPFx components, and system optimization.<br>• <b>Full Stack Developer</b> @ Ice Technology Lab (Feb 2025 - Mar 2025): Built web apps using Python and Django.",
  skills:
    "<b>Core Technical Skills:</b><br>• <b>Languages:</b> Python, Java, JavaScript, HTML5, CSS3, jQuery, Bootstrap 5<br>• <b>Frameworks:</b> Django, SPFx<br>• <b>Platforms:</b> SharePoint (Online & On-Premise)<br>• <b>Tools:</b> Git, VS Code, REST APIs",
  education:
    "Harsh holds a <b>Bachelor of Technology (B.Tech)</b> in Computer Science from Shivalik College of Engineering (2021-2025). He completed his schooling (ISC & ICSE) at Assembly of God Church.",
  projects:
    "Harsh has worked on various projects including:<br>• <b>Portfolio Website:</b> This responsive site you're looking at!<br>• <b>SharePoint Automation:</b> Enterprise workflows and SPFx components.<br>• <b>Django Web Apps:</b> Full-stack applications with Python backend.",
  contact:
    "You can reach Harsh via the <a href='#contact' style='color: #a855f7;'>contact form</a> below. He is also active on <a href='https://www.linkedin.com/in/harsh-sinha-24b65731a/' target='_blank' style='color: #a855f7;'>LinkedIn</a>.",
  summary:
    "<b>Quick Summary:</b><br>Harsh Sinha is a passionate Full Stack Developer & SharePoint Analyst. He converts complex backend logic into smooth, user-friendly experiences. With expertise in Python, Django, and JavaScript, he loves solving real-world business challenges.",
  personality:
    "<b>Nature & Personality:</b><br>Harsh is known for being a proactive problem-solver and a curious learner. He enjoys collaborating with teams, mentoring juniors, and staying updated with the latest tech trends. He values clean code, efficiency, and user-centric design.",
};

function toggleChatbot() {
  chatbotWidget.classList.toggle("active");
  if (chatbotWidget.classList.contains("active")) {
    setTimeout(() => chatInput.focus(), 300);
  }
}

function handleChatInput(event) {
  if (event.key === "Enter") {
    sendUserMessage();
  }
}

function sendUserMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  // Add User Message
  addMessage(message, "user-message");
  chatInput.value = "";

  // Show Typing Indicator
  showTypingIndicator();

  // Simulate Bot Processing and Response
  setTimeout(
    () => {
      hideTypingIndicator();
      const botResponse = getSmartResponse(message);
      addMessage(botResponse, "bot-message");
    },
    1000 + Math.random() * 1000,
  ); // Random delay between 1-2s for realism
}

function addMessage(htmlContent, className) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", className);
  // Allow HTML for better formatting (lists, bold text)
  messageDiv.innerHTML = htmlContent;

  // Insert before typing indicator
  chatbotBody.insertBefore(messageDiv, typingIndicator);
  scrollToBottom();
}

function showTypingIndicator() {
  typingIndicator.style.display = "flex";
  scrollToBottom();
}

function hideTypingIndicator() {
  typingIndicator.style.display = "none";
}

function scrollToBottom() {
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

// Gemini API Key
const GEMINI_API_KEY = "AIzaSyBMhJLQLKFclHYmFHF2oV6f05CnYxuCEWE".trim();

// Redefine sendUserMessage to include voice response
async function sendUserMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  // Add User Message
  addMessage(message, "user-message");
  chatInput.value = "";

  // Show Typing Indicator
  showTypingIndicator();

  try {
    // Get Response from Gemini API (or fallback)
    const botResponse = await getSmartResponse(message);

    hideTypingIndicator();
    addMessage(botResponse, "bot-message");

    // Speak response if voice active
    if (jarvis.isWakeMode) {
      jarvis.speak(botResponse);
    }
  } catch (error) {
    console.error("Error getting response:", error);
    hideTypingIndicator();
    addMessage(
      "I'm having trouble connecting right now (API Error). I'll use my built-in knowledge instead.",
      "bot-message",
    );
    // Explicit fallback display if main message fails
    setTimeout(() => {
      addMessage(getLocalResponse(message), "bot-message");
      if (jarvis.isWakeMode) jarvis.speak(getLocalResponse(message));
    }, 1000);
  }
}

async function getSmartResponse(input) {
  // Construct a system prompt based on the knowledge base
  const contextPrompt = `
  You are an AI assistant for Harsh Sinha's portfolio website. 
  Your name is "Harsh's Assistant" or "Jarvis" if addressed as such.
  Your goal is to answer questions about Harsh based strictly on the information provided below.
  
  -- INFORMATION ABOUT HARSH --
  ${JSON.stringify(knowledgeBase)}
  -----------------------------
  
  Instructions:
  1. Prioritize answering based on the provided information about Harsh.
  2. If the user asks about Harsh (skills, experience, contact, etc.), use the info above.
  3. If the user asks a GENERAL question (e.g., "What is React?", "Tell me a joke", "Who is Bill Gates?"), answer it helpfully using your own knowledge as a large language model.
  4. Be professional, friendly, and concise.
  5. Use bolding (e.g. <b>Text</b>) for key points if helpful.
  6. If asked about "Resume", tell them to click the "My Resume" button.
  
  User Question: ${input}
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: contextPrompt }],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "Model not found (404). API Key might need 'Generative Language API' enabled in Google Cloud Console.",
        );
      }
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check for API Error Responses in body
    if (data.error) {
      throw new Error(data.error.message || "API Error");
    }

    // Check if candidates exist
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];

      // Check for safety blocking
      if (candidate.finishReason === "SAFETY") {
        return "I cannot answer that due to safety guidelines. Please ask something else explicitly about Harsh.";
      }

      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts.length > 0
      ) {
        let text = candidate.content.parts[0].text;
        text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        return text;
      }
    }

    console.warn("Unexpected API Response:", data);
    throw new Error("Invalid API response structure");
  } catch (error) {
    console.error("Gemini API Request Failed:", error);
    throw error; // Rethrow to trigger the fallback in sendUserMessage
  }
}

function getLocalResponse(input) {
  const lowerInput = input.toLowerCase();

  // Check for specific intents
  if (
    lowerInput.includes("summary") ||
    lowerInput.includes("overview") ||
    lowerInput.includes("tell me about harsh")
  ) {
    return knowledgeBase.summary;
  }

  if (
    lowerInput.includes("skill") ||
    lowerInput.includes("tech") ||
    lowerInput.includes("stack") ||
    lowerInput.includes("language")
  ) {
    return knowledgeBase.skills;
  }

  if (
    lowerInput.includes("experience") ||
    lowerInput.includes("work") ||
    lowerInput.includes("job") ||
    lowerInput.includes("career") ||
    lowerInput.includes("company")
  ) {
    return knowledgeBase.experience;
  }

  if (
    lowerInput.includes("education") ||
    lowerInput.includes("college") ||
    lowerInput.includes("degree") ||
    lowerInput.includes("study")
  ) {
    return knowledgeBase.education;
  }

  if (
    lowerInput.includes("project") ||
    lowerInput.includes("built") ||
    lowerInput.includes("create")
  ) {
    return knowledgeBase.projects;
  }

  if (
    lowerInput.includes("contact") ||
    lowerInput.includes("email") ||
    lowerInput.includes("reach") ||
    lowerInput.includes("hire")
  ) {
    return knowledgeBase.contact;
  }

  if (lowerInput.includes("resume") || lowerInput.includes("cv")) {
    return "You can view or download the resume by clicking the <b>'My Resume'</b> button at the top of the page.";
  }

  if (lowerInput.match(/\b(hi|hello|hey|greetings|start)\b/)) {
    return knowledgeBase.greetings[
      Math.floor(Math.random() * knowledgeBase.greetings.length)
    ];
  }

  // Default Fallback
  return "That's a great question! While I'm a simple bot, I can tell you about Harsh's <br>• <b>Experience</b><br>• <b>Skills</b><br>• <b>Education</b><br>• <b>Projects</b><br><br>Or ask for a <b>Summary</b>!";
}

// Jarvis Voice Assistant Logic
class JarvisAssistant {
  constructor() {
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.isWakeMode = false; // "Waiting for Hello Jarvis"
    this.awake = false; // "Listening for command"
    this.isSpeaking = false; // Flag to prevent self-listening
    this.silenceTimer = null;
    this.voices = [];
    this.commandBuffer = ""; // Buffer to accumulate speech
    this.commandTimer = null; // Timer to debounce command processing

    // Initialize Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true; // Keep listening for wake word
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        console.log("Voice Recognition Started");
        this.updateUI();
      };

      this.recognition.onend = () => {
        console.log("Voice Recognition Ended");
        // Auto-restart if we are supposed to be active AND not currently speaking
        if (this.isWakeMode && !this.isSpeaking) {
          try {
            this.recognition.start();
          } catch (e) {
            console.log("Restarting recognition...");
          }
        } else {
          this.updateUI();
        }
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript
          .toLowerCase()
          .trim();
        console.log("Heard:", transcript);

        if (!this.awake) {
          // WAKE WORD DETECTION
          if (
            transcript.includes("hello jarvis") ||
            transcript.includes("hello service") ||
            transcript.includes("hey jarvis")
          ) {
            this.wakeUp();
          }
        } else {
          // COMMAND PROCESSING WITH DEBOUNCING
          // Accumulate the speech input
          this.commandBuffer = transcript;

          // Clear any existing timer
          if (this.commandTimer) {
            clearTimeout(this.commandTimer);
          }

          // Set a new timer to process the command after speech stops
          this.commandTimer = setTimeout(() => {
            if (this.commandBuffer.trim()) {
              this.processCommand(this.commandBuffer);
              this.commandBuffer = ""; // Clear buffer after processing
            }
          }, 1500); // Wait 1.5 seconds after last speech input
        }
      };

      this.recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === "not-allowed") {
          this.stop();
          // alert("Microphone access is required for Jarvis.");
        }
      };
    } else {
      console.warn("Web Speech API not supported in this browser.");
      const btn = document.getElementById("micBtn");
      if (btn) btn.style.display = "none";
    }

    // Load Voices
    window.speechSynthesis.onvoiceschanged = () => {
      this.voices = window.speechSynthesis.getVoices();
    };
  }

  toggle() {
    if (this.isWakeMode) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (!this.recognition) return;
    this.isWakeMode = true;
    this.awake = false; // Start in passive mode waiting for wake word
    try {
      this.recognition.start();
      this.speak("Voice system initialized. Say Hello Jarvis.");
    } catch (e) {
      console.error(e);
    }
    this.updateUI();
  }

  stop() {
    this.isWakeMode = false;
    this.awake = false;
    if (this.recognition) this.recognition.stop();
    this.stopSilenceTimer();
    this.stopCommandTimer(); // Clear any pending command processing
    this.speak("Voice system deactivated.");
    this.updateUI();
  }

  wakeUp() {
    this.awake = true;
    this.speak("Yes?"); // Acknowledge wake word
    this.updateUI();
    this.startSilenceTimer();
  }

  processCommand(text) {
    this.stopSilenceTimer();

    // Show what was heard
    document.getElementById("chatInput").value = text;

    // Use existing message logic
    sendUserMessage();
  }

  speak(text) {
    if (this.synth.speaking) this.synth.cancel();

    // Stop listening while speaking to prevent self-loop
    this.isSpeaking = true;
    if (this.recognition) this.recognition.stop();

    // Remove HTML tags for speech
    const cleanText = text.replace(/<[^>]*>?/gm, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.pitch = 1;

    // Try to select a Male voice
    const preferredVoice =
      this.voices.find(
        (v) =>
          v.name.includes("David") ||
          v.name.includes("Mark") ||
          v.name.includes("Male"),
      ) ||
      this.voices.find((v) => v.name.includes("Google US English")) ||
      this.voices.find((v) => v.lang === "en-US");
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      this.isSpeaking = false;

      // Restart listening after speaking finishes
      if (this.isWakeMode) {
        try {
          this.recognition.start();
        } catch (e) {
          console.log("Resume listening...");
        }
      }

      // If we were awake, reset the timer to wait for follow-up or go to sleep
      if (this.awake) {
        this.startSilenceTimer();
      }
    };

    this.synth.speak(utterance);
  }

  startSilenceTimer() {
    this.stopSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      if (this.awake) {
        this.speak("I'm going back to sleep now.");
        this.awake = false; // Return to Wake Word mode
        this.updateUI();
      }
    }, 15000); // 15 seconds of silence = go to sleep
  }

  stopSilenceTimer() {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
  }

  stopCommandTimer() {
    if (this.commandTimer) {
      clearTimeout(this.commandTimer);
      this.commandTimer = null;
    }
    this.commandBuffer = ""; // Clear buffer
  }

  updateUI() {
    const btn = document.getElementById("micBtn");
    const statusText = document.getElementById("chatStatus");
    const voiceStatus = document.getElementById("voiceStatus");

    if (this.isWakeMode) {
      btn.classList.add("active"); // General Voice Mode On

      if (this.awake) {
        btn.classList.add("listening"); // Currently listening for command
        statusText.style.display = "none";
        voiceStatus.style.display = "block";
        voiceStatus.innerText = "Listening...";
        voiceStatus.style.color = "#ef4444";
      } else {
        btn.classList.remove("listening");
        statusText.style.display = "none";
        voiceStatus.style.display = "block";
        voiceStatus.innerText = "Say 'Hello Jarvis'";
        voiceStatus.style.color = "#a855f7";
      }
    } else {
      btn.classList.remove("active");
      btn.classList.remove("listening");
      statusText.style.display = "inline";
      voiceStatus.style.display = "none";
    }
  }
}

const jarvis = new JarvisAssistant();
