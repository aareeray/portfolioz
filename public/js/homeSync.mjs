// Synchronized 3D card perspective, live metadata, and modal interactions
export function initHomeSync() {
  const root = document.querySelector("[data-home-root]");
  
  // Wires modals regardless of whether on home page or other pages
  initModals();

  if (!root) return () => {};

  const projectItems = Array.from(root.querySelectorAll("[data-project-item]"));
  const cards = Array.from(root.querySelectorAll(".stage-card"));
  const roleEl = root.querySelector("[data-role-val]");
  const launchEl = root.querySelector("[data-launch-val]");
  const counterEl = root.querySelector("[data-counter-current]");
  const stageWrap = root.querySelector(".stage-perspective-wrap");

  if (!projectItems.length || !cards.length) return () => {};

  let activeIndex = 0;

  function setActive(index) {
    if (index < 0 || index >= projectItems.length) return;
    activeIndex = index;
    const item = projectItems[index];

    // 1. Update project items active state
    projectItems.forEach((pi, i) => {
      pi.classList.toggle("is-active", i === index);
    });

    // 2. Update stage 3D cards
    cards.forEach((card, i) => {
      card.classList.remove("is-active", "is-prev", "is-next");
      if (i === index) {
        card.classList.add("is-active");
      } else if (i === index - 1) {
        card.classList.add("is-prev");
      } else if (i === index + 1) {
        card.classList.add("is-next");
      }
    });

    // 3. Update Left Metadata
    if (roleEl && item.dataset.role) {
      roleEl.textContent = item.dataset.role;
    }
    if (launchEl && item.dataset.launch) {
      launchEl.textContent = item.dataset.launch;
    }
    if (counterEl && item.dataset.indexStr) {
      counterEl.textContent = item.dataset.indexStr;
    }
  }

  // Hover on project item
  projectItems.forEach((item, idx) => {
    item.addEventListener("mouseenter", () => {
      setActive(idx);
    });
  });

  // Scroll detection via IntersectionObserver
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.index, 10);
          if (!isNaN(idx)) {
            setActive(idx);
          }
        }
      });
    },
    {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0.1,
    }
  );

  projectItems.forEach((item) => observer.observe(item));

  // Interactive 3D Parallax on Stage
  const onMouseMove = (e) => {
    const activeCard = cards[activeIndex];
    if (!activeCard) return;
    const rect = window.innerWidth;
    const xPct = (e.clientX / rect - 0.5) * 16;
    const yPct = (e.clientY / window.innerHeight - 0.5) * -16;
    activeCard.style.transform = `rotateY(${-8 + xPct}deg) rotateX(${4 + yPct}deg) translateZ(0)`;
  };

  window.addEventListener("mousemove", onMouseMove, { passive: true });

  return () => {
    observer.disconnect();
    window.removeEventListener("mousemove", onMouseMove);
  };
}

function initModals() {
  // Contact Modal
  const contactModal = document.getElementById("contact-modal");
  const openContactBtns = document.querySelectorAll("[data-open-contact]");
  const closeContactBtns = document.querySelectorAll("[data-close-contact]");

  openContactBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (contactModal) {
        contactModal.classList.add("is-open");
        contactModal.setAttribute("aria-hidden", "false");
      }
    });
  });

  closeContactBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (contactModal) {
        contactModal.classList.remove("is-open");
        contactModal.setAttribute("aria-hidden", "true");
      }
    });
  });

  // Showreel Modal
  const showreelModal = document.getElementById("showreel-modal");
  const openShowreelBtns = document.querySelectorAll("[data-open-showreel]");
  const closeShowreelBtns = document.querySelectorAll("[data-close-showreel]");

  openShowreelBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (showreelModal) {
        showreelModal.classList.add("is-open");
        showreelModal.setAttribute("aria-hidden", "false");
      }
    });
  });

  closeShowreelBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (showreelModal) {
        showreelModal.classList.remove("is-open");
        showreelModal.setAttribute("aria-hidden", "true");
      }
    });
  });

  // Esc key closes any open modal
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (contactModal && contactModal.classList.contains("is-open")) {
        contactModal.classList.remove("is-open");
        contactModal.setAttribute("aria-hidden", "true");
      }
      if (showreelModal && showreelModal.classList.contains("is-open")) {
        showreelModal.classList.remove("is-open");
        showreelModal.setAttribute("aria-hidden", "true");
      }
    }
  });
}
