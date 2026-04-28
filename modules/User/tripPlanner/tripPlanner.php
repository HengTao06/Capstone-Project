<?php
require_once "../../../shared/php/db.php";
require_once "../../../shared/php/session.php";

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

/* =============================
   1. POPULAR COMBO
============================= */
if ($method === "GET" && isset($_GET['combo'])) {
    $sql = "
        SELECT 
            td.trip_id,
            t.trip_name,
            c.city_id,
            c.city_name,
            co.country_name,
            COUNT(td.attraction_id) AS total_attractions,
            GROUP_CONCAT(a.attraction_id ORDER BY td.sequence_no SEPARATOR '|') AS attraction_ids,
            GROUP_CONCAT(a.attraction_name ORDER BY td.sequence_no SEPARATOR '|') AS attraction_names,
            GROUP_CONCAT(a.attraction_category ORDER BY td.sequence_no SEPARATOR '|') AS categories,
            GROUP_CONCAT(a.attraction_image ORDER BY td.sequence_no SEPARATOR '|') AS images
        FROM trip_details td
        JOIN trip t ON td.trip_id = t.trip_id
        JOIN city c ON t.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        JOIN attraction a ON td.attraction_id = a.attraction_id
        GROUP BY td.trip_id, t.trip_name, c.city_id, c.city_name, co.country_name
        HAVING total_attractions >= 2
        ORDER BY total_attractions DESC
        LIMIT 3
    ";

    $result = $conn->query($sql);
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(["status" => "success", "combos" => $data]);
    exit();
}

/* =============================
   2. GET ATTRACTIONS
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
            a.attraction_id, a.attraction_name, a.attraction_description,
            a.attraction_category, a.estimated_price, a.best_season,
            a.attraction_image, c.city_id, c.city_name, co.country_name
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
   3. SAVE TRIP
============================= */
if ($method === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);

    $tripName = $input['tripName'];
    $startDate = $input['startDate'];
    $endDate = $input['endDate'];
    $city_id = $input['city_id'];
    $itinerary = $input['itinerary'];

    $user_id = $_SESSION['user_id'] ?? 1;

    $stmt = $conn->prepare("
        INSERT INTO trip (user_id, city_id, trip_name, start_date, end_date, trip_status)
        VALUES (?, ?, ?, ?, ?, 'Planned')
    ");
    $stmt->bind_param("iisss", $user_id, $city_id, $tripName, $startDate, $endDate);

    if (!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
        exit();
    }

    $trip_id = $conn->insert_id;

    $detailStmt = $conn->prepare("
        INSERT INTO trip_details (trip_id, attraction_id, day_number, sequence_no)
        VALUES (?, ?, ?, ?)
    ");

    foreach ($itinerary as $day => $items) {
        $sequence = 1;

        foreach ($items as $item) {
            if (!isset($item['id']) || (int)$item['id'] <= 0) {
                echo json_encode(["status" => "error", "message" => "Invalid attraction ID found."]);
                exit();
            }

            $attractionId = (int)$item['id'];
            $dayNumber = (int)$day;

            $detailStmt->bind_param("iiii", $trip_id, $attractionId, $dayNumber, $sequence);

            if (!$detailStmt->execute()) {
                echo json_encode(["status" => "error", "message" => $detailStmt->error]);
                exit();
            }

            $sequence++;
        }
    }

    echo json_encode(["status" => "success"]);
    exit();
}
?>