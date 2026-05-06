document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("userModal");
  const openBtn = document.querySelector(".add-btn");
  const closeBtn = document.getElementById("closeModal");
  const cancelBtn = document.getElementById("cancelModal");

  // OPEN MODAL
  openBtn.addEventListener("click", () => {
    modal.classList.add("active");
  });

  // CLOSE MODAL
  function closeModal() {
    modal.classList.remove("active");
  }

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // CLICK OUTSIDE TO CLOSE
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
});