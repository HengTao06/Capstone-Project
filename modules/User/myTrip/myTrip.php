<?php
require_once "../../../shared/php/db.php";
require_once "../../../shared/php/session.php";

header("Content-Type: application/json");

$user_id = $_SESSION['user_id'] ?? 1;
$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET" && isset($_GET['trip_id'])) {

    $trip_id = $_GET['trip_id'];

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

    $stmt->bind_param("ii", $trip_id, $user_id);
    $stmt->execute();
    $trip = $stmt->get_result()->fetch_assoc();

    if (!$trip) {
        echo json_encode([
            "status" => "error",
            "message" => "Trip not found"
        ]);
        exit();
    }

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
            "img" => "../../../assets/images/attraction/" . $row['attraction_image'],
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
   GET ALL TRIPS
============================= */
if ($method === "GET") {

    $sql = "
        SELECT 
            t.trip_id,
            t.trip_name,
            t.start_date,
            t.end_date,
            t.trip_status,
            COUNT(td.attraction_id) AS total_attractions
        FROM trip t
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

        // get itinerary
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
   POST ACTIONS
============================= */
if ($method === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        echo json_encode(["status" => "error", "message" => "Invalid input"]);
        exit();
    }

    if ($input['action'] === 'updateStatus') {

        $stmt = $conn->prepare("
            UPDATE trip SET trip_status = ?
            WHERE trip_id = ? AND user_id = ?
        ");

        $stmt->bind_param("sii", $input['status'], $input['trip_id'], $user_id);
        $stmt->execute();

        echo json_encode(["status" => "success"]);
        exit();
    }

    if ($input['action'] === 'delete') {

        $stmt = $conn->prepare("
            DELETE FROM trip WHERE trip_id = ? AND user_id = ?
        ");

        $stmt->bind_param("ii", $input['trip_id'], $user_id);
        $stmt->execute();

        echo json_encode(["status" => "success"]);
        exit();
    }
}
?>