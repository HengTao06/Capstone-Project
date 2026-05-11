<?php
require_once "../../../shared/php/db.php";

header("Content-Type: application/json");

$sql = "
    SELECT 
        review.review_id,
        review.user_id,
        review.attraction_id,
        review.rating,
        review.comment,
        review.review_date,
        users.username,
        users.user_profile,
        attraction.attraction_name,
        attraction.attraction_image
    FROM review
    JOIN users 
        ON review.user_id = users.user_id
    JOIN attraction 
        ON review.attraction_id = attraction.attraction_id
    ORDER BY review.review_date DESC
";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        "status" => "error",
        "message" => $conn->error
    ]);
    exit();
}

$reviews = [];

while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

echo json_encode($reviews);
?>