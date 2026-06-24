const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const conditionCards = document.querySelectorAll(".condition-card");
const conditionDetail = document.getElementById("conditionDetail");
const conditionTitle = document.getElementById("conditionTitle");
const conditionText = document.getElementById("conditionText");
const copyBibtex = document.getElementById("copyBibtex");
const bibtexText = document.getElementById("bibtexText");
const copyBibtexStatus = document.getElementById("copyBibtexStatus");

function applyTheme(theme) {
  const isDark = theme === "dark";
  root.classList.toggle("dark", isDark);
  themeIcon.textContent = isDark ? "light_mode" : "dark_mode";
}

(function initializeTheme() {
  const savedTheme = localStorage.getItem("cypsy-theme");
  if (savedTheme) {
    applyTheme(savedTheme);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
})();

themeToggle?.addEventListener("click", () => {
  const next = root.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("cypsy-theme", next);
});

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenuClose = document.getElementById("mobileMenuClose");
const mobileNav = document.getElementById("mobileNav");
const menuIcon = document.getElementById("menuIcon");

function openMobileMenu() {
  mobileNav?.classList.add("is-open");
  mobileMenuBtn?.setAttribute("aria-expanded", "true");
  if (menuIcon) menuIcon.textContent = "close";
}

function closeMobileMenu() {
  mobileNav?.classList.remove("is-open");
  mobileMenuBtn?.setAttribute("aria-expanded", "false");
  if (menuIcon) menuIcon.textContent = "menu";
}

mobileMenuBtn?.addEventListener("click", () => {
  const isOpen = mobileNav?.classList.contains("is-open");
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

mobileMenuClose?.addEventListener("click", closeMobileMenu);

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileNav?.classList.contains("is-open")) {
    closeMobileMenu();
  }
});

document.addEventListener("click", (event) => {
  if (!mobileNav?.classList.contains("is-open")) return;
  const clickedInside = mobileNav.contains(event.target) || mobileMenuBtn?.contains(event.target);
  if (!clickedInside) {
    closeMobileMenu();
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal-on-scroll").forEach((element) => revealObserver.observe(element));

conditionCards.forEach((card) => {
  card.addEventListener("click", () => {
    conditionCards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");

    conditionTitle.textContent = card.dataset.title || "";
    conditionText.textContent = card.dataset.detail || "";
    conditionDetail.classList.remove("hidden");
    conditionDetail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

copyBibtex?.addEventListener("click", async () => {
  const content = bibtexText?.innerText || "";

  try {
    await navigator.clipboard.writeText(content);
    copyBibtexStatus.textContent = "BibTeX copied.";
  } catch {
    copyBibtexStatus.textContent = "Clipboard blocked. Copy manually.";
  }
});

const sectionAnchors = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    }
  });
}, { threshold: 0.45 });

sectionAnchors.forEach((section) => activeObserver.observe(section));

function initializeSlideViewer() {
  const viewer = document.querySelector("[data-slide-viewer]");
  if (!viewer) {
    return;
  }

  const totalSlides = Number.parseInt(viewer.dataset.totalSlides || "0", 10);
  if (!Number.isInteger(totalSlides) || totalSlides < 1) {
    return;
  }

  const slidePrefix = viewer.dataset.slidePrefix || "";
  const slideExtension = viewer.dataset.slideExtension || ".png";
  const slideImage = document.getElementById("slideImage");
  const slideCaption = document.getElementById("slideCaption");
  const slideCounter = document.getElementById("slideCounter");
  const slideRange = document.getElementById("slideRange");
  const slidePrev = document.getElementById("slidePrev");
  const slideNext = document.getElementById("slideNext");
  const slideThumbs = document.getElementById("slideThumbs");
  const slideLive = document.getElementById("slideLive");
  const slideOpen = document.getElementById("slideOpen");
  const slideStage = document.getElementById("slideStage");

  if (
    !slideImage ||
    !slideCaption ||
    !slideCounter ||
    !slideRange ||
    !slidePrev ||
    !slideNext ||
    !slideThumbs ||
    !slideStage
  ) {
    return;
  }

  const slides = Array.from({ length: totalSlides }, (_, index) => {
    const number = index + 1;
    const src = `${slidePrefix}${number}${slideExtension}`;
    return {
      number,
      src,
      alt: `Slide ${number} from the 6ICHP presentation on personas and Split or Steal.`,
      caption: `EN: Conference presentation slide ${number}. PT: Diapositivo ${number} da apresentacao da conferencia.`
    };
  });

  slideRange.min = "1";
  slideRange.max = String(totalSlides);
  slideRange.value = "1";

  let currentIndex = 0;
  let touchStartX = 0;

  function updateThumbState() {
    const thumbs = slideThumbs.querySelectorAll(".slide-thumb");
    thumbs.forEach((thumb, index) => {
      thumb.classList.toggle("is-active", index === currentIndex);
      thumb.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });

    const currentThumb = thumbs[currentIndex];
    currentThumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  function updateControlState() {
    slidePrev.disabled = currentIndex === 0;
    slideNext.disabled = currentIndex === totalSlides - 1;
  }

  function setSlide(index) {
    const clamped = Math.max(0, Math.min(index, totalSlides - 1));
    currentIndex = clamped;
    const active = slides[currentIndex];

    slideImage.src = active.src;
    slideImage.alt = active.alt;
    slideCaption.textContent = active.caption;
    slideCounter.textContent = `${active.number} / ${totalSlides}`;
    slideRange.value = String(active.number);
    slideLive && (slideLive.textContent = `Showing slide ${active.number} of ${totalSlides}.`);

    if (slideOpen) {
      slideOpen.href = active.src;
    }

    updateControlState();
    updateThumbState();
  }

  function goToNextSlide() {
    setSlide(currentIndex + 1);
  }

  function goToPreviousSlide() {
    setSlide(currentIndex - 1);
  }

  slides.forEach((slide, index) => {
    const thumbButton = document.createElement("button");
    thumbButton.type = "button";
    thumbButton.className = "slide-thumb";
    thumbButton.setAttribute("aria-label", `Go to slide ${slide.number}`);
    thumbButton.dataset.slideIndex = String(index);

    const thumbImage = document.createElement("img");
    thumbImage.src = slide.src;
    thumbImage.loading = "lazy";
    thumbImage.decoding = "async";
    thumbImage.alt = `Thumbnail of slide ${slide.number}`;

    const thumbLabel = document.createElement("span");
    thumbLabel.textContent = `Slide ${slide.number}`;

    thumbButton.appendChild(thumbImage);
    thumbButton.appendChild(thumbLabel);
    thumbButton.addEventListener("click", () => setSlide(index));
    slideThumbs.appendChild(thumbButton);
  });

  slidePrev.addEventListener("click", goToPreviousSlide);
  slideNext.addEventListener("click", goToNextSlide);

  slideRange.addEventListener("input", () => {
    const target = Number.parseInt(slideRange.value, 10) - 1;
    setSlide(target);
  });

  document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement?.tagName;
    const isTypingField = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";

    if (isTypingField && document.activeElement !== slideRange) {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextSlide();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousSlide();
    }

    if (event.key === "Home") {
      event.preventDefault();
      setSlide(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      setSlide(totalSlides - 1);
    }
  });

  slideStage.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });

  slideStage.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0]?.clientX || 0;
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) < 45) {
      return;
    }

    if (deltaX < 0) {
      goToNextSlide();
      return;
    }

    goToPreviousSlide();
  }, { passive: true });

  slideImage.addEventListener("error", () => {
    slideCaption.textContent = "Slide image could not be loaded.";
  });

  setSlide(0);
}

initializeSlideViewer();