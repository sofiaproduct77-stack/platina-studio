(function () {
  const header = document.querySelector(".header");
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav-toggle");
  const yearEl = document.getElementById("year");
  const path = window.location.pathname.replace(/\\/g, "/");
  const page = path.split("/").pop() || "index.html";
  const isServicePage = /^service-/.test(page) || page === "services.html";

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  if (nav) {
    nav.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("tel:")) return;
      const target = href.split("/").pop();
      if (target === page || (page === "" && target === "index.html")) {
        link.classList.add("is-active");
      }
    });
    const servicesTrigger = nav.querySelector(".nav-dropdown__trigger");
    if (servicesTrigger && isServicePage) {
      servicesTrigger.classList.add("is-active");
    }
  }

  const navDropdown = document.querySelector("[data-nav-dropdown]");
  if (navDropdown) {
    const trigger = navDropdown.querySelector(".nav-dropdown__trigger");
    const panel = navDropdown.querySelector(".nav-dropdown__panel");
    const mqMobile = window.matchMedia("(max-width: 960px)");

    function setOpen(open) {
      navDropdown.classList.toggle("is-open", open);
      if (trigger) trigger.setAttribute("aria-expanded", String(open));
    }

    let closeHoverTimer = 0;

    function clearCloseHoverTimer() {
      if (closeHoverTimer) {
        window.clearTimeout(closeHoverTimer);
        closeHoverTimer = 0;
      }
    }

    if (trigger) {
      trigger.addEventListener("click", (e) => {
        if (mqMobile.matches) {
          e.preventDefault();
          setOpen(!navDropdown.classList.contains("is-open"));
        }
      });
    }

    navDropdown.addEventListener("mouseenter", () => {
      if (mqMobile.matches) return;
      clearCloseHoverTimer();
      setOpen(true);
    });

    navDropdown.addEventListener("mouseleave", () => {
      if (mqMobile.matches) return;
      clearCloseHoverTimer();
      closeHoverTimer = window.setTimeout(() => setOpen(false), 160);
    });

    document.addEventListener("click", (e) => {
      if (!navDropdown.contains(e.target)) setOpen(false);
    });

    if (panel) {
      panel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
      });
    }
  }

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 16);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  document.querySelectorAll(".booking-form").forEach((form) => {
    if (form.closest("[data-booking-wizard]")) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "гость").trim();
      alert(`Спасибо, ${name}! Администратор PLATINA перезвонит в ближайшее время.`);
      form.reset();
    });
  });

  if (nav) {
    nav.style.transition = "transform 0.45s var(--ease), opacity 0.45s var(--ease)";
  }
})();