<?php
include '../../../shared/php/session.php';
include '../../../shared/php/db.php';

$sql = "
SELECT review.*, users.username,
       attraction.attraction_image
FROM review
JOIN users ON review.user_id = users.user_id
JOIN attraction ON review.attraction_id = attraction.attraction_id
ORDER BY review.review_date DESC
";

$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Manage Reviews</title>

    <link rel="stylesheet" href="../../../shared/css/global.css">
    <link rel="stylesheet" href="../../../shared/css/components.css">
    <link rel="stylesheet" href="../../../shared/css/header-footer.css">
    <link rel="stylesheet" href="../../../shared/css/variables.css">

    <link rel="stylesheet" href="M_reviews.css">
</head>

<body>

<?php include '../../../shared/partials/header_admin.html'; ?>

<div class="review-page">

    <div class="breadcrumb">
        Home > Manage Reviews
    </div>

    <h2>User Reviews</h2>

    <div class="filter-row">

        <select>
            <option>All Review</option>
        </select>

        <select>
            <option>All Attraction</option>
        </select>

    </div>

    <div class="review-grid">

        <?php while($row = $result->fetch_assoc()): ?>

        <div class="review-card">

            <!-- USER -->
            <div class="review-top">

                <div class="user-info">

                    <img src="../../../assets/images/black.png">

                    <div>
                        <h4><?= $row['username']; ?></h4>

                        <div class="rating">
                            <?php for($i=0;$i<$row['rating'];$i++): ?>
                                ⭐
                            <?php endfor; ?>
                        </div>
                    </div>

                </div>

                <span class="review-date">
                    <?= date("M d, Y", strtotime($row['review_date'])); ?>
                </span>

            </div>

            <img class="review-image"
                 src="../../../assets/images/<?= $row['attraction_image']; ?>">

            <p class="review-text">
                <?= $row['comment']; ?>
            </p>

            <div class="review-actions">

                <button class="view-btn"
                    onclick="openModal(
                    '<?= addslashes($row['username']); ?>',
                    '<?= addslashes($row['comment']); ?>',
                    '../../../assets/images/<?= $row['attraction_image']; ?>',
                    '<?= $row['rating']; ?>'
                    )">
                    View Details
                </button>

                <button class="delete-btn"
                    onclick="openDelete(<?= $row['review_id']; ?>)">
                    Delete
                </button>

            </div>

        </div>

        <?php endwhile; ?>

    </div>

</div>

<div id="reviewModal" class="modal">

    <div class="modal-box">

        <span class="close-btn"
            onclick="closeModal()">×</span>

        <div class="modal-user">

            <img src="../../../assets/images/black.png">

            <div>
                <h3 id="modalUser"></h3>
                <div id="modalRating"></div>
            </div>

        </div>

        <img id="modalImage" class="modal-image">

        <p id="modalComment"></p>

        <div class="modal-actions">

            <button class="close-modal-btn"
                onclick="closeModal()">
                Close
            </button>

            <button class="delete-btn"
                id="modalDeleteBtn">
                Delete
            </button>

        </div>

    </div>

</div>

<div id="deleteModal" class="modal">

    <div class="delete-box">

        <h3>Delete Confirmation</h3>

        <p>Are you sure you want to delete this review?</p>

        <div class="delete-actions">

            <button class="close-modal-btn"
                onclick="closeDelete()">
                Close
            </button>

            <button class="delete-btn"
                id="confirmDeleteBtn">
                Delete
            </button>

        </div>

    </div>

</div>

<?php include '../../../shared/partials/footer.html'; ?>

<script src="../../../shared/js/main.js"></script>

<script src="M_reviews.js"></script>

</body>
</html>