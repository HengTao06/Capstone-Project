<?php
require_once "../../../shared/php/db.php";
require_once "../../../shared/php/session.php";

header("Content-Type: application/json");

$response = [
    "recommended" => [],
    "popularCombos" => [],
    "trending" => []
];

/* =============================
   1. RECOMMENDED DESTINATIONS
============================= */
$recommendedSql = "
    SELECT 
        a.attraction_id,
        a.attraction_name,
        a.attraction_image,
        c.city_id,
        c.city_name,
        co.country_name,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating,
        COUNT(r.review_id) AS total_reviews
    FROM attraction a
    INNER JOIN city c ON a.city_id = c.city_id
    INNER JOIN country co ON c.country_id = co.country_id
    LEFT JOIN review r ON a.attraction_id = r.attraction_id
    GROUP BY 
        a.attraction_id,
        a.attraction_name,
        a.attraction_image,
        c.city_id,
        c.city_name,
        co.country_name
    ORDER BY 
        average_rating DESC,
        total_reviews DESC
    LIMIT 6
";

$recommendedResult = $conn->query($recommendedSql);

if ($recommendedResult) {
    while ($row = $recommendedResult->fetch_assoc()) {
        $response["recommended"][] = $row;
    }
}

/* =============================
   2. POPULAR TRAVEL COMBOS
============================= */
$comboSql = "
    SELECT 
        td.trip_id,
        t.trip_name,
        c.city_name,
        co.country_name,
        COUNT(DISTINCT td.attraction_id) AS total_attractions,
        GROUP_CONCAT(DISTINCT a.attraction_name ORDER BY a.attraction_name SEPARATOR ' + ') AS combo_name,
        GROUP_CONCAT(DISTINCT a.attraction_category ORDER BY a.attraction_category SEPARATOR ', ') AS categories,
        MIN(a.attraction_image) AS combo_image
    FROM trip_details td
    INNER JOIN trip t ON td.trip_id = t.trip_id
    INNER JOIN city c ON t.city_id = c.city_id
    INNER JOIN country co ON c.country_id = co.country_id
    INNER JOIN attraction a ON td.attraction_id = a.attraction_id
    GROUP BY 
        td.trip_id,
        t.trip_name,
        c.city_name,
        co.country_name
        HAVING total_attractions >= 2
    ORDER BY 
        total_attractions DESC,
        td.trip_id DESC
    LIMIT 6
";

$comboResult = $conn->query($comboSql);

if ($comboResult) {
    while ($row = $comboResult->fetch_assoc()) {
        $response["popularCombos"][] = $row;
    }
}

/* =============================
   3. TRENDING DESTINATIONS
============================= */
$trendingSql = "
    SELECT 
        c.city_id,
        c.city_name,
        co.country_name,
        COUNT(t.trip_id) AS completed_trips,
        MIN(a.attraction_image) AS attraction_image
    FROM trip t
    INNER JOIN city c ON t.city_id = c.city_id
    INNER JOIN country co ON c.country_id = co.country_id
    LEFT JOIN attraction a ON c.city_id = a.city_id
    WHERE t.trip_status = 'Completed'
    GROUP BY 
        c.city_id,
        c.city_name,
        co.country_name
    ORDER BY 
        completed_trips DESC,
        c.city_name ASC
    LIMIT 8
";

$trendingResult = $conn->query($trendingSql);

if ($trendingResult) {
    while ($row = $trendingResult->fetch_assoc()) {
        $response["trending"][] = $row;
    }
}

echo json_encode($response);
?>