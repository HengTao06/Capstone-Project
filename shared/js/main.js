document.addEventListener("DOMContentLoaded", async function () {
    const headerBox = document.getElementById("header");
    const footerBox = document.getElementById("footer");
    const projectRoot = window.location.pathname.split("/modules/")[0];

    try {
        if (headerBox) {
            const headerResponse = await fetch(`${projectRoot}/shared/partials/header.html`);
            const headerHTML = await headerResponse.text();
            headerBox.innerHTML = headerHTML;
        }

        if (footerBox) {
            const footerResponse = await fetch(`${projectRoot}/shared/partials/footer.html`);
            const footerHTML = await footerResponse.text();
            footerBox.innerHTML = footerHTML;
        }

        const currentPage = document.body.dataset.page;

        document.querySelectorAll(".header-nav a").forEach(link => {
            if (link.dataset.link === currentPage) {
                link.classList.add("active");
            }
        });

    } catch (error) {
        console.error("Header/Footer loading error:", error);
    }
});