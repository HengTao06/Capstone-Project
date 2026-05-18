<?php
require_once "../../../shared/php/db.php";

$sql = "
SELECT 
    attraction.attraction_id,
    attraction.attraction_name,
    attraction.attraction_description,
    attraction.attraction_category,
    attraction.attraction_image,
    city.city_name,
    country.country_name,
    IFNULL(ROUND(AVG(review.rating), 1), 0) AS avg_rating
FROM attraction
LEFT JOIN city ON attraction.city_id = city.city_id
LEFT JOIN country ON city.country_id = country.country_id
LEFT JOIN review ON attraction.attraction_id = review.attraction_id
GROUP BY attraction.attraction_id
ORDER BY attraction.attraction_id DESC
";

$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

header("Content-Type: application/json");
echo json_encode($data);
?>