<?php 
// include '../../../shared/php/session.php';
// include '../../../shared/php/db.php';
?>

<!DOCTYPE html>
<html lang="en">
  <head>
      <meta charset="UTF-8">
      <title>Manage Reviews</title>

      <!-- ✅ SHARED CSS -->
      <link rel="stylesheet" href="../../../shared/css/global.css">
      <link rel="stylesheet" href="../../../shared/css/components.css">
      <link rel="stylesheet" href="../../../shared/css/header-footer.css">
      <link rel="stylesheet" href="../../../shared/css/variables.css">

  </head>

  <body>

  <!-- ✅ HEADER -->
  <?php include '../../../shared/partials/header_admin.html'; ?>

  <main class="container">

  <h2>User Reviews</h2>

  <div class="reviews-grid">

  <?php
  $sql = "
  SELECT review.*, users.username,
        attraction.attraction_name, attraction.attraction_image
  FROM review
  JOIN users ON review.user_id = users.user_id
  JOIN attraction ON review.attraction_id = attraction.attraction_id
  ORDER BY review_date DESC
  ";

  $result = $conn->query($sql);

  while($row = $result->fetch_assoc()):
  ?>

  <div class="card">

    <!-- USER -->
    <div class="card-header">
      <img src="../../../assets/images/black.png" class="user-img">
      <div>
        <strong><?= $row['username'] ?></strong><br>
        <small><?= $row['review_date'] ?></small>
      </div>
    </div>

    <!-- IMAGE -->
    <img class="card-img" src="../../../assets/images/<?= $row['attraction_image'] ?>">

    <!-- RATING -->
    <div class="stars">
      <?php for($i=0;$i<$row['rating'];$i++) echo "⭐"; ?>
    </div>

    <!-- COMMENT -->
    <p><?= $row['comment'] ?></p>

    <!-- ACTION -->
    <div class="card-actions">
      <button onclick="openModal('<?= addslashes($row['comment']) ?>','../../../assets/images/<?= $row['attraction_image'] ?>')">
        View Details
      </button>

      <a href="delete.php?id=<?= $row['review_id'] ?>" class="btn-danger">
        Delete
      </a>
    </div>

  </div>

  <?php endwhile; ?>

  </div>
  </main>

  <!-- ✅ MODAL -->
  <div id="modal" class="modal">
    <div class="modal-content">
      <span class="close" onclick="closeModal()">×</span>
      <img id="modalImg">
      <p id="modalText"></p>
    </div>
  </div>

  <!-- ✅ FOOTER -->
  <?php include '../../../shared/partials/footer.html'; ?>

  <!-- ✅ SHARED JS -->
  <script src="../../../shared/js/main.js"></script>

  <!-- YOUR JS -->
  <script src="M_reviews.js"></script>

  <div class="card">
    <div class="card-header">
      <img src="../../../assets/images/black.png" class="user-img">
      <div>
        <strong>John Doe</strong><br>
        <small>2026-04-29</small>
      </div>
    </div>

    <img class="card-img" src="../../../assets/images/sample.jpg">

    <div class="stars">⭐⭐⭐⭐⭐</div>

    <p>This is a sample review comment.</p>

    <div class="card-actions">
      <button onclick="openModal('Sample comment','../../../assets/images/sample.jpg')">
        View Details
      </button>

      <a href="#" class="btn-danger">Delete</a>
    </div>
  </div>
  </body>
</html>