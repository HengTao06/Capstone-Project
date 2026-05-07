<?php

include '../../../shared/php/db.php';

if(isset($_GET['id'])){

    $id = $_GET['id'];

    $sql = "DELETE FROM review WHERE review_id = $id";

    $conn->query($sql);
}

header("Location: M_reviews.php");
exit;
?>