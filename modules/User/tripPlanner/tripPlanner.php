<?php
require_once "../../../shared/php/db.php";
require_once "../../../shared/php/session.php";

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

/* =============================
   1. GET ATTRACTIONS (for modal)
   Only load attractions for selected city/country
============================= */
if ($method === "GET") {

    $cityName = $_GET["city"] ?? "Osaka";
    $countryName = $_GET["country"] ?? "Japan";

    $stmt = $conn->prepare("
        SELECT 
            a.attraction_id,
            a.attraction_name,
            a.attraction_description,
            a.attraction_category,
            a.estimated_price,
            a.best_season,
            a.attraction_image,
            c.city_id,
            c.city_name,
            co.country_name,
            ROUND(COALESCE(AVG(r.rating), 0), 1) AS average_rating,
            COUNT(r.review_id) AS total_reviews
        FROM attraction a
        JOIN city c ON a.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        LEFT JOIN review r ON a.attraction_id = r.attraction_id
        WHERE c.city_name = ?
        AND co.country_name = ?
        GROUP BY
            a.attraction_id,
            a.attraction_name,
            a.attraction_description,
            a.attraction_category,
            a.estimated_price,
            a.best_season,
            a.attraction_image,
            c.city_id,
            c.city_name,
            co.country_name
        ORDER BY a.attraction_name ASC
    ");

    $stmt->bind_param("ss", $cityName, $countryName);
    $stmt->execute();

    $result = $stmt->get_result();

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "city" => $cityName,
        "country" => $countryName,
        "attractions" => $data
    ]);

    exit();
}

/* =============================
   2. SAVE TRIP
============================= */
if ($method === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    $tripName = $input['tripName'];
    $startDate = $input['startDate'];
    $endDate = $input['endDate'];
    $city_id = $input['city_id'];
    $itinerary = $input['itinerary'];

    $user_id = $_SESSION['user_id'] ?? 1;

    // Insert trip
    $stmt = $conn->prepare("
        INSERT INTO trip (user_id, city_id, trip_name, start_date, end_date, trip_status)
        VALUES (?, ?, ?, ?, ?, 'Planned')
    ");
    $stmt->bind_param("iisss", $user_id, $city_id, $tripName, $startDate, $endDate);
    $stmt->execute();

    $trip_id = $conn->insert_id;

    // Insert trip details
    $detailStmt = $conn->prepare("
        INSERT INTO trip_details (trip_id, attraction_id, day_number, sequence_no)
        VALUES (?, ?, ?, ?)
    ");

    foreach ($itinerary as $day => $items) {
        $sequence = 1;

        foreach ($items as $item) {
            $detailStmt->bind_param("iiii", $trip_id, $item['id'], $day, $sequence);
            $detailStmt->execute();
            $sequence++;
        }
    }

    echo json_encode(["status" => "success"]);
    exit();
}

/* =============================
    3. Popular Combo
============================= */

if (isset($_GET['combo'])) {

    $sql = "
        SELECT 
            td.trip_id,
            t.trip_name,
            GROUP_CONCAT(a.attraction_name SEPARATOR ' + ') AS combo_name,
            GROUP_CONCAT(a.attraction_image) AS images
        FROM trip_details td
        JOIN trip t ON td.trip_id = t.trip_id
        JOIN attraction a ON td.attraction_id = a.attraction_id
        GROUP BY td.trip_id
        HAVING COUNT(td.attraction_id) >= 2
        ORDER BY COUNT(td.attraction_id) DESC
        LIMIT 3
    ";

    $result = $conn->query($sql);

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    exit();
}
?>