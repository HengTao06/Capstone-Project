<?php
require_once "../../../shared/php/db.php";
require_once "../../../shared/php/session.php";

header("Content-Type: application/json");

ini_set('display_errors', 1);
error_reporting(E_ALL);

$user_id = $_SESSION['user_id'] ?? 1;
$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET" && isset($_GET['combo'])) {

    $city_id = $_GET['city_id'] ?? null;

    if (!$city_id) {
        echo json_encode([
            "status" => "error",
            "message" => "City ID is required",
            "combos" => []
        ]);
        exit();
    }

    $sql = "
        SELECT 
            t.trip_id,
            t.trip_name,
            c.city_name,
            co.country_name,
            COUNT(td.attraction_id) AS total_attractions,
            GROUP_CONCAT(a.attraction_id ORDER BY td.day_number, td.sequence_no SEPARATOR '|') AS attraction_ids,
            GROUP_CONCAT(a.attraction_name ORDER BY td.day_number, td.sequence_no SEPARATOR '|') AS attraction_names,
            GROUP_CONCAT(a.attraction_category ORDER BY td.day_number, td.sequence_no SEPARATOR '|') AS categories,
            GROUP_CONCAT(a.attraction_image ORDER BY td.day_number, td.sequence_no SEPARATOR '|') AS images
        FROM trip t
        JOIN trip_details td ON t.trip_id = td.trip_id
        JOIN attraction a ON td.attraction_id = a.attraction_id
        JOIN city c ON t.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        WHERE t.city_id = ?
        GROUP BY t.trip_id, t.trip_name, c.city_name, co.country_name
        HAVING total_attractions >= 2
        ORDER BY total_attractions DESC
        LIMIT 6
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $city_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "combos" => $data
    ]);
    exit();
}


/* =============================
   GET DESTINATIONS
============================= */
if ($method === "GET" && isset($_GET['destinations'])) {

    $sql = "
        SELECT 
            c.city_id,
            c.city_name,
            co.country_name
        FROM city c
        JOIN country co ON c.country_id = co.country_id
        ORDER BY co.country_name, c.city_name
    ";

    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit();
    }

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "destinations" => $data
    ]);

    exit();
}

/* =============================
   GET ATTRACTIONS BY CITY
============================= */
if ($method === "GET" && isset($_GET['city_id'])) {

    $city_id = (int) $_GET['city_id'];

    $stmt = $conn->prepare("
        SELECT 
            a.attraction_id,
            a.attraction_name,
            a.attraction_description,
            a.attraction_category,
            a.estimated_price,
            a.best_season,
            a.attraction_image,
            c.city_name,
            co.country_name
        FROM attraction a
        JOIN city c ON a.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        WHERE c.city_id = ?
        ORDER BY a.attraction_name ASC
    ");

    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit();
    }

    $stmt->bind_param("i", $city_id);
    $stmt->execute();

    $result = $stmt->get_result();

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "attractions" => $data
    ]);

    exit();
}

/* =============================
   1. GET SINGLE TRIP (FOR EDIT)
============================= */
if ($method === "GET" && isset($_GET['trip_id'])) {

    $trip_id = $_GET['trip_id'];

    // Get trip info
    $stmt = $conn->prepare("
        SELECT 
            t.trip_id,
            t.trip_name,
            t.start_date,
            t.end_date,
            t.city_id,
            c.city_name,
            co.country_name
        FROM trip t
        JOIN city c ON t.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        WHERE t.trip_id = ? AND t.user_id = ?
    ");

    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit();
    }

    $stmt->bind_param("ii", $trip_id, $user_id);
    $stmt->execute();
    $trip = $stmt->get_result()->fetch_assoc();

    if (!$trip) {
        echo json_encode(["status" => "error", "message" => "Trip not found"]);
        exit();
    }

    // Get itinerary
    $stmt2 = $conn->prepare("
        SELECT 
            td.day_number,
            td.sequence_no,
            a.attraction_id,
            a.attraction_name,
            a.attraction_category,
            a.attraction_image
        FROM trip_details td
        JOIN attraction a ON td.attraction_id = a.attraction_id
        WHERE td.trip_id = ?
        ORDER BY td.day_number, td.sequence_no
    ");

    if (!$stmt2) {
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit();
    }

    $stmt2->bind_param("i", $trip_id);
    $stmt2->execute();
    $result = $stmt2->get_result();

    $itinerary = [];

    while ($row = $result->fetch_assoc()) {
        $day = $row['day_number'];

        if (!isset($itinerary[$day])) {
            $itinerary[$day] = [];
        }

        $itinerary[$day][] = [
            "id" => $row['attraction_id'],
            "name" => $row['attraction_name'],
            "category" => $row['attraction_category'],
            "img" => "../../../assets/images/" . $row['attraction_image'],
            "day" => $day,
            "time" => "09:00"
        ];
    }

    echo json_encode([
        "status" => "success",
        "trip" => $trip,
        "itinerary" => $itinerary
    ]);

    exit();
}


/* =============================
   2. GET ALL TRIPS
============================= */
if ($method === "GET") {

    $sql = "
        SELECT 
            t.trip_id,
            t.trip_name,
            t.start_date,
            t.end_date,
            t.trip_status,
            c.city_name,
            co.country_name,
            COUNT(td.attraction_id) AS total_attractions
        FROM trip t
        JOIN city c ON t.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        LEFT JOIN trip_details td ON t.trip_id = td.trip_id
        WHERE t.user_id = ?
        GROUP BY t.trip_id
        ORDER BY t.trip_id DESC
    ";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit();
    }

    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $trips = [];

    while ($row = $result->fetch_assoc()) {

        $trip_id = $row['trip_id'];

        $detailStmt = $conn->prepare("
            SELECT 
                td.day_number,
                a.attraction_name,
                a.attraction_category
            FROM trip_details td
            JOIN attraction a ON td.attraction_id = a.attraction_id
            WHERE td.trip_id = ?
            ORDER BY td.day_number, td.sequence_no
        ");

        if (!$detailStmt) {
            echo json_encode(["status" => "error", "message" => $conn->error]);
            exit();
        }

        $detailStmt->bind_param("i", $trip_id);
        $detailStmt->execute();
        $detailResult = $detailStmt->get_result();

        $itinerary = [];

        while ($d = $detailResult->fetch_assoc()) {
            $day = $d['day_number'];

            if (!isset($itinerary[$day])) {
                $itinerary[$day] = [];
            }

            $itinerary[$day][] = [
                "name" => $d['attraction_name'],
                "category" => $d['attraction_category']
            ];
        }

        $trips[] = [
            "id" => $trip_id,
            "name" => $row['trip_name'],
            "startDate" => $row['start_date'],
            "endDate" => $row['end_date'],
            "status" => $row['trip_status'],
            "attractions" => $row['total_attractions'],
            "itinerary" => $itinerary
        ];
    }

    echo json_encode([
        "status" => "success",
        "trips" => $trips
    ]);

    exit();
}

/* =============================
   SAVE / UPDATE TRIP
============================= */
if ($method === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        echo json_encode(["status" => "error", "message" => "Invalid input"]);
        exit();
    }

    $trip_id = $input['trip_id'] ?? null;
    $tripName = $input['tripName'];
    $startDate = $input['startDate'];
    $endDate = $input['endDate'];
    $city_id = $input['city_id'];
    $itinerary = $input['itinerary'];

    $user_id = $_SESSION['user_id'] ?? 1;

    // =========================
    // UPDATE EXISTING TRIP
    // =========================
    if ($trip_id) {

        // update trip
        $stmt = $conn->prepare("
            UPDATE trip 
            SET trip_name = ?, start_date = ?, end_date = ?, city_id = ?
            WHERE trip_id = ? AND user_id = ?
        ");

        if (!$stmt) {
            echo json_encode(["status" => "error", "message" => $conn->error]);
            exit();
        }

        $stmt->bind_param("sssiii", $tripName, $startDate, $endDate, $city_id, $trip_id, $user_id);

        if (!$stmt->execute()) {
            echo json_encode(["status" => "error", "message" => $stmt->error]);
            exit();
        }

        // delete old itinerary
        $deleteStmt = $conn->prepare("DELETE FROM trip_details WHERE trip_id = ?");
        $deleteStmt->bind_param("i", $trip_id);
        $deleteStmt->execute();

    } else {
        // =========================
        // INSERT NEW TRIP
        // =========================
        $stmt = $conn->prepare("
            INSERT INTO trip (user_id, city_id, trip_name, start_date, end_date, trip_status)
            VALUES (?, ?, ?, ?, ?, 'Planned')
        ");

        if (!$stmt) {
            echo json_encode(["status" => "error", "message" => $conn->error]);
            exit();
        }

        $stmt->bind_param("iisss", $user_id, $city_id, $tripName, $startDate, $endDate);

        if (!$stmt->execute()) {
            echo json_encode(["status" => "error", "message" => $stmt->error]);
            exit();
        }

        $trip_id = $conn->insert_id;
    }

    // =========================
    // INSERT NEW ITINERARY
    // =========================
    $detailStmt = $conn->prepare("
        INSERT INTO trip_details (trip_id, attraction_id, day_number, sequence_no)
        VALUES (?, ?, ?, ?)
    ");

    if (!$detailStmt) {
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit();
    }

    foreach ($itinerary as $day => $items) {
        $sequence = 1;

        foreach ($items as $item) {

            if (!isset($item['id']) || (int)$item['id'] <= 0) {
                echo json_encode([
                    "status" => "error",
                    "message" => "Invalid attraction ID"
                ]);
                exit();
            }

            $attractionId = (int)$item['id'];
            $dayNumber = (int)$day;

            $detailStmt->bind_param("iiii", $trip_id, $attractionId, $dayNumber, $sequence);

            if (!$detailStmt->execute()) {
                echo json_encode([
                    "status" => "error",
                    "message" => $detailStmt->error
                ]);
                exit();
            }

            $sequence++;
        }
    }

    echo json_encode(["status" => "success"]);
    exit();
}
?>