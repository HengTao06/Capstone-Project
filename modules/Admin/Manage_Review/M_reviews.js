function openModal(text, img) {
    document.getElementById("modal").style.display = "flex";
    document.getElementById("modalText").innerText = text;
    document.getElementById("modalImg").src = img;
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}