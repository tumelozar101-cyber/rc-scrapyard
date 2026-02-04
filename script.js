document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------
  // Footer year
  // ----------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----------------------------
  // Lightbox (auto-create if missing)
  // ----------------------------
  function ensureLightbox() {
    let overlay = document.getElementById("lightbox");
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "lightbox";
    overlay.id = "lightbox";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Close image">×</button>
      <img class="lightbox-img" alt="">
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  const lightbox = ensureLightbox();
  const lightboxImg = lightbox.querySelector(".lightbox-img");
  const lightboxClose = lightbox.querySelector(".lightbox-close");

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    // Clear after animation/paint
    setTimeout(() => {
      lightboxImg.src = "";
      lightboxImg.alt = "";
    }, 50);
  }

  document.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-lightbox]");
    if (!img) return;
    openLightbox(img.currentSrc || img.src, img.alt);
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });

  // ----------------------------
  // Carousel (supports multiple carousels)
  // ----------------------------
  function initCarousel(carousel) {
    const track = carousel.querySelector(".carousel-track");
    const slides = track ? Array.from(track.children) : [];
	const counterEl = carousel.querySelector("[data-counter]");
    const prevBtn = carousel.querySelector("[data-prev]");
    const nextBtn = carousel.querySelector("[data-next]");
    const dotsWrap = carousel.querySelector("[data-dots]");

    if (!track || slides.length === 0 || !prevBtn || !nextBtn) return;

    let index = 0;
    const maxIndex = slides.length - 1;

    function setTo(i) {
      index = Math.max(0, Math.min(maxIndex, i));
	  if (counterEl) counterEl.textContent = `${index + 1} / ${slides.length}`;
      track.style.transform = `translateX(-${index * 100}%)`;

      if (dotsWrap) {
        const dots = Array.from(dotsWrap.querySelectorAll(".carousel-dot"));
        dots.forEach((d, di) => d.classList.toggle("active", di === index));
      }
    }

    // Build dots
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => setTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    prevBtn.addEventListener("click", () => setTo(index - 1));
    nextBtn.addEventListener("click", () => setTo(index + 1));

    // Swipe / drag
    let startX = 0;
    let dragging = false;

    carousel.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return; // don't start drag on buttons
      dragging = true;
      startX = e.clientX;
      carousel.setPointerCapture(e.pointerId);
    });

    carousel.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;

      const delta = e.clientX - startX;
      const threshold = 40; // px
      if (delta > threshold) setTo(index - 1);
      else if (delta < -threshold) setTo(index + 1);
    });

    carousel.addEventListener("pointercancel", () => {
      dragging = false;
    });

    // Initial
    setTo(0);
  }

  document.querySelectorAll("[data-carousel]").forEach(initCarousel);
});
