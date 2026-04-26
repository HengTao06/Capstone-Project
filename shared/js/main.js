document.addEventListener("DOMContentLoaded", async function () {

  const header = document.getElementById("header");
  const footer = document.getElementById("footer");

  try {
    // Load header
    if (header) {
      const headerRes = await fetch("../../../shared/partials/header.html");
      const headerHTML = await headerRes.text();
      header.innerHTML = headerHTML;
    }

    // Load footer
    if (footer) {
      const footerRes = await fetch("../../../shared/partials/footer.html");
      const footerHTML = await footerRes.text();
      footer.innerHTML = footerHTML;
    }

    // Set active nav
    const currentPage = document.body.dataset.page;

    document.querySelectorAll(".header-nav a").forEach(link => {
      if (link.dataset.link === currentPage) {
        link.classList.add("active");
      }
    });

  } catch (error) {
    console.error("Error loading header/footer:", error);
  }

}); 