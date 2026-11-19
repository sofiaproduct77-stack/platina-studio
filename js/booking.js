(function () {
  const wizard = document.querySelector("[data-booking-wizard]");
  if (!wizard) return;

  const steps = Array.from(wizard.querySelectorAll("[data-booking-step]"));
  const progressBars = Array.from(wizard.querySelectorAll("[data-progress-step]"));
  const btnBack = wizard.querySelector("[data-booking-back]");
  const btnNext = wizard.querySelector("[data-booking-next]");
  const btnSubmit = wizard.querySelector("[data-booking-submit]");
  let current = 0;

  const state = {
    service: "",
    serviceLabel: "",
    master: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    comment: "",
  };

  function showStep(index) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((el, i) => el.classList.toggle("is-active", i === current));
    progressBars.forEach((el, i) => {
      el.classList.toggle("is-current", i === current);
      el.classList.toggle("is-done", i < current);
    });
    const onLast = current === steps.length - 2;
    const isSuccess = steps[current]?.dataset.bookingStep === "success";
    if (btnBack) btnBack.hidden = current === 0 || isSuccess;
    if (btnNext) btnNext.hidden = onLast || isSuccess;
    if (btnSubmit) btnSubmit.hidden = !onLast;
    wizard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  wizard.querySelectorAll("[data-pick-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      wizard.querySelectorAll("[data-pick-service]").forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      state.service = btn.dataset.pickService;
      state.serviceLabel = btn.querySelector("strong")?.textContent || "";
    });
  });

  wizard.querySelectorAll("[data-pick-master]").forEach((btn) => {
    btn.addEventListener("click", () => {
      wizard.querySelectorAll("[data-pick-master]").forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      state.master = btn.dataset.pickMaster;
    });
  });

  wizard.querySelectorAll("[data-pick-slot]").forEach((btn) => {
    btn.addEventListener("click", () => {
      wizard.querySelectorAll("[data-pick-slot]").forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      state.time = btn.dataset.pickSlot;
    });
  });

  const dateInput = wizard.querySelector('input[name="date"]');
  if (dateInput) {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    dateInput.min = today.toISOString().slice(0, 10);
    dateInput.addEventListener("change", () => {
      state.date = dateInput.value;
    });
  }

  function validateContact() {
    const nameInput = wizard.querySelector('input[name="name"]');
    const phoneInput = wizard.querySelector('input[name="phone"]');
    let ok = true;
    wizard.querySelectorAll(".booking-error").forEach((el) => el.classList.remove("is-visible"));
    nameInput?.classList.remove("is-invalid");
    phoneInput?.classList.remove("is-invalid");

    const name = String(nameInput?.value || "").trim();
    const phone = String(phoneInput?.value || "").trim().replace(/\s/g, "");

    if (name.length < 2) {
      ok = false;
      nameInput?.classList.add("is-invalid");
      wizard.querySelector("[data-error-name]")?.classList.add("is-visible");
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      ok = false;
      phoneInput?.classList.add("is-invalid");
      wizard.querySelector("[data-error-phone]")?.classList.add("is-visible");
    }
    if (ok) {
      state.name = name;
      state.phone = phone;
      state.comment = String(wizard.querySelector('textarea[name="comment"]')?.value || "").trim();
    }
    return ok;
  }

  function validateStep() {
    if (current === 0 && !state.service) {
      return false;
    }
    if (current === 2) {
      if (!state.date && dateInput) state.date = dateInput.value;
      if (!state.date || !state.time) return false;
    }
    return true;
  }

  btnNext?.addEventListener("click", () => {
    if (!validateStep()) return;
    showStep(current + 1);
  });

  btnBack?.addEventListener("click", () => showStep(current - 1));

  btnSubmit?.addEventListener("click", () => {
    if (!validateContact()) return;
    wizard.classList.add("booking-loading");
    setTimeout(() => {
      wizard.classList.remove("booking-loading");
      const summary = wizard.querySelector("[data-booking-summary]");
      if (summary) {
        summary.innerHTML = `
          <p><strong>${state.name}</strong>, ждём вас ${state.date || "—"} в ${state.time || "—"}.</p>
          <p>${state.serviceLabel}${state.master ? " · " + state.master : ""}</p>
          <p>Мы перезвоним на ${state.phone} для подтверждения.</p>`;
      }
      showStep(steps.findIndex((s) => s.dataset.bookingStep === "success"));
    }, 900);
  });

  wizard.querySelectorAll("[data-booking-form]").forEach((form) => {
    form.addEventListener("submit", (e) => e.preventDefault());
  });

  showStep(0);
})();