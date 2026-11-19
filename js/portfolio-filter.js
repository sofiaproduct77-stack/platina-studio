(function () {
  const filters = document.querySelectorAll("[data-portfolio-filter]");
  const items = document.querySelectorAll("[data-portfolio-item]");
  if (!filters.length || !items.length) return;

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("data-portfolio-filter");
      filters.forEach((b) => b.classList.toggle("is-active", b === btn));
      items.forEach((fig) => {
        const itemCat = fig.getAttribute("data-portfolio-item");
        const show = cat === "all" || itemCat === cat;
        fig.classList.toggle("is-hidden", !show);
      });
    });
  });
})();