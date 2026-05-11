<?php

include '../../../shared/php/db.php';

$sql = "
SELECT review.*,
       users.username,
       attraction.attraction_image
FROM review
JOIN users
ON review.user_id = users.user_id
JOIN attraction
ON review.attraction_id = attraction.attraction_id
ORDER BY review.review_date DESC
";

$result = $conn->query($sql);

$reviews = [];

while($row = $result->fetch_assoc()){

    $reviews[] = $row;
}

header('Content-Type: application/json');

echo json_encode($reviews);
?>