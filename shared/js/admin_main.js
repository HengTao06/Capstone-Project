document.addEventListener("DOMContentLoaded", async function () {
    const headerBox = document.getElementById("header");
    const projectRoot = window.location.pathname.split("/modules/")[0];

    try {
        if (headerBox) {
            const headerResponse = await fetch(`${projectRoot}/shared/partials/header_admin.html`);
            const headerHTML = await headerResponse.text();
            headerBox.innerHTML = headerHTML;
        }

        const currentPage = document.body.dataset.page;

        document.querySelectorAll(".header-nav a").forEach(link => {
            if (link.dataset.link === currentPage) {
                link.classList.add("active");
            }
        });

    } catch (error) {
        console.error("Header loading error:", error);
    }
});
