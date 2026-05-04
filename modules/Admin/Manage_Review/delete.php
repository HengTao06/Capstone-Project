<?php
include '../../../shared/php/db.php';

$id = $_GET['id'];

$conn->query("DELETE FROM review WHERE review_id = $id");

header("Location: M_reviews.php");
exit;
?>