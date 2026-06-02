// Force scroll to top on reload/load to ensure clean entry
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

function initPDFWorker() {
  if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
}

// Advanced 3D Intersection Observer using Anime.js
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting &&
        !entry.target.classList.contains("animated")
      ) {
        entry.target.classList.add("animated");

        // Temporarily disable CSS transitions to let Anime.js take over 3D animations completely
        entry.target.style.transition = "none";
        entry.target.style.opacity = "1";

        // Advanced 3D entrance animation with Anime.js
        anime({
          targets: entry.target,
          opacity: [0, 1],
          translateY: [100, 0],
          translateZ: [150, 0],
          rotateX: [15, 0],
          scale: [0.95, 1],
          easing: "easeOutElastic(1, .8)",
          duration: 1500,
          filter: ["blur(10px)", "blur(0px)"],
        });

        // Animate child elements in 3D stagger if present (Bento cards, skills, etc)
        const childCards = entry.target.querySelectorAll(
          ".bento-card, .skill, .academic-box, .interest-box",
        );
        if (childCards.length > 0) {
          // Prepare children
          childCards.forEach((c) => {
            c.style.opacity = "0";
            c.style.transform =
              "translateY(40px) translateZ(100px) rotateX(10deg)";
          });

          anime({
            targets: childCards,
            opacity: [0, 1],
            translateY: [40, 0],
            translateZ: [100, 0],
            rotateX: [10, 0],
            easing: "easeOutElastic(1, .8)",
            duration: 1200,
            delay: anime.stagger(100, { start: 300 }),
          });
        }
      }
    });
  },
  { threshold: 0.1 },
);

const hiddenElements = document.querySelectorAll(".scroll-reveal");
hiddenElements.forEach((el) => observer.observe(el));

// Hero Section 3D Animations via Anime.js
function runHeroEntranceAnimation() {
  // 3D properties that CSS doesn't handle as cleanly for complex entrance
  anime.set(".intro h1", {
    translateZ: 150,
    rotateX: -20,
  });
  anime.set(".social-links .btn", {
    opacity: 0,
    translateY: 20,
    translateZ: 50,
  });
  anime.set(".profile-img-container", {
    rotateY: 20,
  });

  anime
    .timeline({
      easing: "easeOutElastic(1, .8)",
    })
    .add({
      targets: ".intro h1",
      opacity: [0, 1],
      translateY: [30, 0], // Matches CSS initial state
      translateZ: [150, 0],
      rotateX: [-20, 0],
      duration: 1500,
      delay: 300,
    })
    .add(
      {
        targets: ".intro p",
        opacity: [0, 1],
        translateY: [20, 0], // Matches CSS initial state
        duration: 1200,
      },
      "-=1000",
    )
    .add(
      {
        targets: ".social-links .btn",
        opacity: [0, 1],
        translateY: [20, 0],
        translateZ: [50, 0],
        duration: 1200,
        delay: anime.stagger(150),
      },
      "-=800",
    )
    .add(
      {
        targets: ".profile-img-container",
        opacity: [1, 1], // Force full visibility
        scale: [1, 1],
        translateX: [0, 0],
        rotateY: [0, 0],
        duration: 1, // Near instant
      },
      "-=1200",
    );
}

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
lenis.scrollTo(0, { immediate: true });

// Handle anchor links for Lenis
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    lenis.scrollTo(this.getAttribute("href"));
  });
});

const timelineSection = document.querySelector(".journey-section");
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

// Function to load scripts dynamically
async function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initVanillaTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  
  // Bento Cards
  VanillaTilt.init(document.querySelectorAll(".bento-card"), {
    max: 5,
    speed: 400,
    glare: true,
    "max-glare": 0.2,
    scale: 1.02,
    gyroscope: true,
  });

  // Skill Cards
  VanillaTilt.init(document.querySelectorAll(".skill"), {
    max: 8,
    speed: 400,
    glare: true,
    "max-glare": 0.1,
    scale: 1.05
  });

  // Interest Boxes
  VanillaTilt.init(document.querySelectorAll(".interest-box"), {
    max: 5,
    speed: 400,
    scale: 1.02
  });

  // Academic Box
  VanillaTilt.init(document.querySelectorAll(".academic-box"), {
    max: 5,
    speed: 400,
    scale: 1.02
  });

  // Timeline Items (Educational Milestones)
  VanillaTilt.init(document.querySelectorAll(".timeline-item .content"), {
    max: 5,
    speed: 400,
    scale: 1.02,
    glare: true,
    "max-glare": 0.1
  });

  // Contact Container
  VanillaTilt.init(document.querySelectorAll(".contact-container"), {
    max: 3,
    speed: 400,
    scale: 1.01,
    glare: true,
    "max-glare": 0.05
  });
}

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

    // Detect if PDF.js is loaded, else load it dynamically
    if (typeof pdfjsLib === 'undefined') {
        const loadingMsg = document.createElement('div');
        loadingMsg.id = "pdfLoadingMsg";
        loadingMsg.innerText = "Loading PDF viewer...";
        loadingMsg.style.color = "white";
        loadingMsg.style.textAlign = "center";
        loadingMsg.style.padding = "20px";
        mobileContainer.appendChild(loadingMsg);

        loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js").then(() => {
            const msg = document.getElementById("pdfLoadingMsg");
            if (msg) msg.remove();
            if (!isMobileRendered) renderMobilePDF("document/Harsh_Kumar_Sinha_Resume.pdf");
        });
    } else if (!isMobileRendered) {
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
  initPDFWorker();
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
    "Hello! I'm ready to answer your questions about Harsh.",
    "Greetings! Ask me anything about Harsh's work.",
  ],
  about: "",
  experience: "",
  skills: "",
  education: "",
  projects: "",
  contact: "",
  summary: "",
  personality: "",
};

// Dynamically update Knowledge Base from DOM content
function updateDynamicKnowledgeBase() {
  try {
    // 1. Update Summary from Intro
    const introParams = document.querySelector(".intro p");
    if (introParams) {
      knowledgeBase.summary = `<b>Quick Summary:</b><br>${introParams.textContent.trim()}`;
    }

    // 2. Update About
    const aboutSection = document.querySelector(".about");
    if (aboutSection) {
      const texts = Array.from(aboutSection.querySelectorAll("p"))
        .map((p) => p.textContent.trim())
        .filter((text) => text.length > 0)
        .join("<br><br>");
      if (texts) knowledgeBase.about = texts;
    }

    // 3. Update Skills
    const skillsGrid = document.querySelector(".skills-grid");
    if (skillsGrid) {
      let skillsList = [];
      skillsGrid.querySelectorAll(".skill").forEach((skill) => {
        const title = skill.querySelector("h3")?.textContent.trim();
        if (title) skillsList.push(title);
      });

      // Compact Skills from Overview
      const compactSkills = document.querySelectorAll(
        ".skills-overview .skill-item span",
      );
      compactSkills.forEach((s) => skillsList.push(s.textContent.trim()));

      // Unique skills
      skillsList = [...new Set(skillsList)];

      if (skillsList.length > 0) {
        knowledgeBase.skills = `<b>Core Technical Skills:</b><br>${skillsList.join(", ")}`;
      }
    }

    // 4. Update Experience & Projects
    const expSection = document.querySelector(".experience-section");
    if (expSection) {
      let expHTML = "<b>Professional Experience:</b><br>";
      let projectsHTML = "<b>Key Projects & Achievements:</b><br>";
      const cards = expSection.querySelectorAll(".bento-card");

      cards.forEach((card) => {
        const duration = card.querySelector(".duration")?.textContent.trim();
        if (duration) {
          const role = card.querySelector("h3")?.textContent.trim();
          // Get company name, removing extra whitespace from SVG/newlines
          let company =
            card
              .querySelector(".company-name")
              ?.textContent.replace(/\s+/g, " ")
              .trim() || "";

          expHTML += `• <b>${role}</b> @ ${company} (${duration})<br>`;

          // Extract achievements for Projects
          const achievements = card.querySelectorAll(
            ".achievement-list li div",
          );
          achievements.forEach((ach) => {
            const title = ach.querySelector("strong")?.textContent.trim();
            const desc = ach.querySelector("p")?.textContent.trim();
            if (title) {
              projectsHTML += `• <b>${title}</b>: ${desc}<br>`;
            }
          });
        }
      });
      knowledgeBase.experience = expHTML;
      knowledgeBase.projects = projectsHTML;
    }

    // 5. Update Education from Timeline
    const timeline = document.querySelector(".timeline-container");
    if (timeline) {
      let eduHTML = "<b>Education History:</b><br>";
      const items = timeline.querySelectorAll(".timeline-item .content");
      items.forEach((item) => {
        const year = item.querySelector("h3")?.textContent.trim();
        const school = item.querySelector("h4")?.textContent.trim();
        const degree = item.querySelector("p")?.textContent.trim();
        eduHTML += `• <b>${school}</b>: ${degree} (${year})<br>`;
      });
      knowledgeBase.education = eduHTML;
    }

    // 6. Update Contact
    const footerSocials = document.querySelectorAll(".footer-socials a");
    let contactHTML =
      "You can reach Harsh via the <a href='#contact' style='color: #a855f7;'>contact form</a> below.<br>";
    if (footerSocials.length > 0) {
      contactHTML += "<b>Social Links:</b><br>";
      footerSocials.forEach((link) => {
        const url = link.href;
        const imgAlt = link.querySelector("img")?.alt || "Profile";
        contactHTML += `• <a href='${url}' target='_blank' style='color: #a855f7;'>${imgAlt}</a><br>`;
      });
      knowledgeBase.contact = contactHTML;
    }

    console.log("Knowledge Base updated from DOM");
  } catch (e) {
    console.warn("Failed to update knowledge base dynamically:", e);
  }
}

// Run update on load when idle to keep thread free for FCP/LCP
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => updateDynamicKnowledgeBase(), { timeout: 4000 });
} else {
  setTimeout(() => updateDynamicKnowledgeBase(), 4000);
}

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
  You are Harsh Sinha's personal AI assistant and representative.
  Your name is "Jarvis" or "Harsh's Assistant".
  You speak ON BEHALF of Harsh Sinha, representing him directly to visitors of his portfolio website.
  
  -- INFORMATION ABOUT HARSH (Your Owner) --
  ${JSON.stringify(knowledgeBase)}
  -----------------------------
  
  PERSONALITY & TONE:
  - Speak as Harsh's trusted personal assistant, like a professional representative
  - Use phrases like "Harsh has...", "He specializes in...", "His experience includes..."
  - Be warm, professional, and helpful - you're representing Harsh's brand
  - Show enthusiasm about Harsh's skills and accomplishments
  
  STRICT Instructions:
  1. ONLY answer questions about Harsh Sinha using the information provided above.
  2. When asked about skills, experience, education, projects, or contact info - provide detailed, enthusiastic answers from the data above.
  3. If asked GENERAL questions NOT about Harsh (e.g., "What is React?", "Tell me a joke", "Who is Bill Gates?"), politely decline:
     - Example: "I'm Harsh's personal assistant, so I focus on answering questions about him. Ask me about his skills, projects, or experience!"
  4. Be conversational and engaging - you're the first impression visitors get of Harsh.
  5. Use bolding (e.g. <b>Text</b>) for emphasis on key skills or achievements.
  6. If asked about "Resume", say: "You can view Harsh's resume by clicking the 'My Resume' button at the top of the page!"
  7. NEVER provide general knowledge unrelated to Harsh Sinha.
  8. If someone asks "Who are you?", respond: "I'm Jarvis, Harsh's personal AI assistant. I'm here to help you learn about his skills, experience, and projects!"
  
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

  // Specific questions about the site features
  if (lowerInput.includes("loader") || lowerInput.includes("loading")) {
    return "That's a custom preloader built with CSS animations! It adds a touch of uniqueness before showcasing the main content.";
  }

  if (
    lowerInput.includes("moving") ||
    lowerInput.includes("mouse") ||
    lowerInput.includes("effect")
  ) {
    return "That's a 3D Parallax effect in the hero section! It reacts to your mouse movement to create a sense of depth.";
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

/* =========================================
   Theme Switcher Logic
   ========================================= */
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.buttons = document.querySelectorAll(".theme-btn");
    this.html = document.documentElement;
    this.storedTheme = localStorage.getItem("theme") || "system";

    // Initialize
    this.init();
  }

  init() {
    // For mobile devices, force system theme to respect device settings
    // since the toggle is hidden
    if (window.innerWidth <= 768) {
      this.storedTheme = "system";
    }

    // Set initial active state
    this.setActiveButton(this.storedTheme);
    this.applyTheme(this.storedTheme);

    // Event Listeners
    this.buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.dataset.theme;
        this.setTheme(theme);
      });
    });

    // System preference listener
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (this.storedTheme === "system") {
          this.applyTheme("system");
        }
      });
  }

  setTheme(theme) {
    this.storedTheme = theme;
    localStorage.setItem("theme", theme);
    this.setActiveButton(theme);
    this.applyTheme(theme);
  }

  setActiveButton(theme) {
    // Update active class on buttons
    this.buttons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.theme === theme) {
        btn.classList.add("active");
      }
    });

    // Update indicator position via data attribute on parent
    if (this.themeToggle) {
      this.themeToggle.setAttribute("data-active", theme);
    }
  }

  applyTheme(theme) {
    let targetTheme = theme;

    if (theme === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      targetTheme = systemDark ? "dark" : "light";
    }

    // Apply to HTML element
    if (targetTheme === "light") {
      this.html.setAttribute("data-theme", "light");
    } else {
      this.html.removeAttribute("data-theme"); // Default is dark
    }
  }
}

// Initialize Theme Manager & Preloader
document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();

  // Preloader Counting Logic
  const preloader = document.getElementById("preloader");
  const circleFill = document.getElementById("loader-circle-fill");
  const percentageText = document.getElementById("loader-percentage");

  if (preloader) {
    let count = 0;
    const speed = 12; // Base speed of count steps

    function updateLoader() {
      // realistic increments
      let increment = 1;
      if (count < 35) {
        increment = Math.floor(Math.random() * 4) + 2;
      } else if (count < 80) {
        increment = Math.floor(Math.random() * 2) + 1;
      } else {
        increment = 1;
      }

      count += increment;
      if (count > 100) count = 100;

      if (percentageText) {
        percentageText.innerHTML = `${count}<span class="loader-pct">%</span>`;
      }
      if (circleFill) {
        const circumference = 2 * Math.PI * 46; // ~289.03
        const offset = circumference - (count / 100) * circumference;
        circleFill.style.strokeDashoffset = offset;
      }

      if (count < 100) {
        // Slow down at the very end
        const delay = count > 80 ? speed + 25 : speed;
        setTimeout(updateLoader, delay);
      } else {
        // Loading complete!
        setTimeout(() => {
          document.body.classList.add("loaded");
          
          // Let screen slide up/fade out (400ms transition), then trigger entrance
          setTimeout(() => {
            initVanillaTilt();
            new TypingEffect();
            initFloatingNav();
            runHeroEntranceAnimation();
          }, 350);
        }, 150);
      }
    }

    // Start counting loop
    updateLoader();
  } else {
    // Fallback if preloader is not in the DOM
    initVanillaTilt();
    new TypingEffect();
    initFloatingNav();
    runHeroEntranceAnimation();
  }
});

// Typing Effect
class TypingEffect {
  constructor() {
    this.textElement = document.getElementById("typing-text");
    this.cursorElement = document.querySelector(".cursor");
    this.words = [
      "Computer Science Graduate",
      "Full Stack Developer",
      "SharePoint Specialist",
      "Tech Enthusiast",
      "Problem Solver",
    ];
    this.wordIndex = 0;
    this.isDeleting = false;
    this.txt = "";
    this.typeSpeed = 100;

    this.isPaused = false;

    // Intersection Observer to pause when not visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isPaused = !entry.isIntersecting;
      });
    });

    if (this.textElement) {
      observer.observe(document.querySelector(".intro"));
      this.type();
    }
  }

  type() {
    if (this.isPaused) {
      setTimeout(() => this.type(), 500);
      return;
    }

    const current = this.wordIndex % this.words.length;
    const fullTxt = this.words[current];

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
      this.typeSpeed = 50;
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
      this.typeSpeed = 100;
    }

    this.textElement.innerHTML = this.txt;

    let typeSpeed = this.typeSpeed;

    if (!this.isDeleting && this.txt === fullTxt) {
      typeSpeed = 2000; // Pause at end of word
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      this.wordIndex++;
      typeSpeed = 500; // Pause before new word
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// Floating Navigation Logic
function initFloatingNav() {
  const sections = document.querySelectorAll("section, .intro");
  const navItems = document.querySelectorAll(".floating-nav .nav-item");

  if (!navItems.length) return;

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.3, // Trigger when 30% of section is visible
  };

  const observer = new IntersectionObserver((entries) => {
    requestAnimationFrame(() => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navItems.forEach((item) => item.classList.remove("active"));
          const id = entry.target.getAttribute("id");
          if (id) {
            const activeLink = document.querySelector(`.floating-nav a[href="#${id}"]`);
            if (activeLink) activeLink.classList.add("active");
            else if (id === "home") {
              const homeLink = document.querySelector(`.floating-nav a[href="#"]`);
              if (homeLink) homeLink.classList.add("active");
            }
          }
        }
      });
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });

  // Click Event for Smooth Scroll
  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = item.getAttribute("href").substring(1);

      // Update Active State Visuals
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      if (targetId === "" || targetId === "#") {
        lenis.scrollTo(0); // Scroll to top for Home
      } else {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          lenis.scrollTo(targetElement);
        }
      }
    });
  });
}

  // Hero Parallax Effect - Removed per user request
  /*
  const introSection = document.querySelector(".intro");
  const heading = document.querySelector(".intro h1");
  const subtext = document.querySelector(".intro p");

  if (!introSection || !heading) return;

  introSection.addEventListener("mousemove", (e) => {
    if (introSection._throttle) return;
    introSection._throttle = true;
    requestAnimationFrame(() => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const x = (centerX - e.clientX) / 50;
      const y = (centerY - e.clientY) / 50;
      heading.style.transform = `translate(${x}px, ${y}px)`;
      if (subtext) subtext.style.transform = `translate(${x * 1.5}px, ${y * 1.5}px)`;
      introSection._throttle = false;
    });
  });

  // Reset on mouse leave
  introSection.addEventListener("mouseleave", () => {
    heading.style.transition = "transform 0.5s ease";
    heading.style.transform = `translate(0, 0)`;

    if (subtext) {
      subtext.style.transition = "transform 0.5s ease";
      subtext.style.transform = `translate(0, 0)`;
    }

    setTimeout(() => {
      heading.style.transition = "";
      if (subtext) subtext.style.transition = "";
    }, 500);
  });
  */
