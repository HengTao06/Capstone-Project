let selectedReviewId = null;

function openModal(user, comment, image, rating){

    document.getElementById("reviewModal").style.display = "flex";

    document.getElementById("modalUser").innerText = user;
    document.getElementById("modalComment").innerText = comment;
    document.getElementById("modalImage").src = image;

    let stars = "";

    for(let i=0;i<rating;i++){
        stars += "⭐";
    }

    document.getElementById("modalRating").innerText = stars;
}

function closeModal(){
    document.getElementById("reviewModal").style.display = "none";
}

function openDelete(id){

    selectedReviewId = id;

    document.getElementById("deleteModal").style.display = "flex";
}

function closeDelete(){
    document.getElementById("deleteModal").style.display = "none";
}

document.getElementById("confirmDeleteBtn").onclick = function(){

    window.location.href =
        "delete.php?id=" + selectedReviewId;
};