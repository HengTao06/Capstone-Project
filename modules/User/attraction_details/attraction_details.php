<?php
require_once "../../../shared/php/db.php";

header("Content-Type: application/json");

$type = $_GET["type"] ?? "";
$id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;

if ($id <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid ID"]);
    exit();
}

/* ================= ATTRACTION ================= */
if ($type === "attraction") {

    $stmt = $conn->prepare("
        SELECT 
            a.attraction_id,
            a.city_id,
            a.attraction_name,
            a.attraction_description,
            a.attraction_image,
            a.attraction_category,
            a.estimated_price,
            a.best_season,
            c.city_name,
            co.country_name,
            ROUND(COALESCE(AVG(r.rating), 0), 1) AS rating,
            COUNT(r.review_id) AS review_count
        FROM attraction a
        JOIN city c ON a.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        LEFT JOIN review r ON a.attraction_id = r.attraction_id
        WHERE a.attraction_id = ?
        GROUP BY 
            a.attraction_id,
            a.attraction_name,
            a.attraction_description,
            a.attraction_image,
            a.attraction_category,
            a.estimated_price,
            a.best_season,
            c.city_name,
            co.country_name
    ");

    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if (!$row) {
        echo json_encode(["status" => "error", "message" => "Attraction not found"]);
        exit();
    }

    $reviewStmt = $conn->prepare("
        SELECT 
            r.rating,
            r.comment,
            r.review_date,
            u.username,
            u.user_profile
        FROM review r
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE r.attraction_id = ?
        ORDER BY r.rating DESC, r.review_date DESC
        LIMIT 5
    ");

    $reviewStmt->bind_param("i", $id);
    $reviewStmt->execute();
    $reviewResult = $reviewStmt->get_result();

    $reviews = [];

    while ($r = $reviewResult->fetch_assoc()) {
        $reviews[] = [
            "username" => $r["username"] ?? "User",
            "profile_picture" => $r["user_profile"] ?? "",
            "rating" => $r["rating"],
            "comment" => $r["comment"],
            "review_date" => $r["review_date"]
        ];
    }

    echo json_encode([
        "status" => "ok",
        "type" => "attraction",
        "id" => $row["attraction_id"],
        "city_id" => $row["city_id"],
        "name" => $row["attraction_name"],
        "description" => $row["attraction_description"],
        "image" => $row["attraction_image"],
        "location" => $row["city_name"] . ", " . $row["country_name"],
        "categories" => [$row["attraction_category"]],
        "rating" => $row["rating"],
        "review_count" => $row["review_count"],
        "estimated_price" => $row["estimated_price"],
        "best_season" => $row["best_season"],
        "reviews" => $reviews
    ]);
    exit();
}

/* ================= COMBO ================= */
if ($type === "combo") {

    $stmt = $conn->prepare("
        SELECT 
            t.trip_id,
            t.trip_name,
            c.city_id,
            c.city_name,
            co.country_name,
            GROUP_CONCAT(DISTINCT a.attraction_name ORDER BY a.attraction_name SEPARATOR ', ') AS name,
            MIN(a.attraction_image) AS image,
            GROUP_CONCAT(DISTINCT a.attraction_category ORDER BY a.attraction_category SEPARATOR ',') AS categories,
            ROUND(COALESCE(AVG(r.rating), 0), 1) AS rating,
            COUNT(r.review_id) AS review_count,
            SUM(COALESCE(a.estimated_price, 0)) AS estimated_price
        FROM trip t
        JOIN trip_details td ON t.trip_id = td.trip_id
        JOIN attraction a ON td.attraction_id = a.attraction_id
        JOIN city c ON t.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        LEFT JOIN review r ON a.attraction_id = r.attraction_id
        WHERE t.trip_id = ?
        GROUP BY 
            t.trip_id,
            t.trip_name,
            c.city_name,
            co.country_name
    ");

    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if (!$row) {
        echo json_encode(["status" => "error", "message" => "Combo not found"]);
        exit();
    }

    $reviewStmt = $conn->prepare("
        SELECT 
            r.rating,
            r.comment,
            r.review_date,
            a.attraction_name,
            u.username,
            u.user_profile
        FROM review r
        JOIN trip_details td ON r.attraction_id = td.attraction_id
        JOIN attraction a ON r.attraction_id = a.attraction_id
        LEFT JOIN users u ON r.user_id = u.user_id
        WHERE td.trip_id = ?
        ORDER BY r.rating DESC, r.review_date DESC
        LIMIT 5
    ");

    $reviewStmt->bind_param("i", $id);
    $reviewStmt->execute();
    $reviewResult = $reviewStmt->get_result();

    $reviews = [];

    while ($r = $reviewResult->fetch_assoc()) {
        $reviews[] = [
            "username" => $r["username"] ?? "User",
            "rating" => $r["rating"],
            "comment" => $r["comment"],
            "review_date" => $r["review_date"],
            "profile_picture" => $r["user_profile"] ?? "",
            "attraction_name" => $r["attraction_name"]
        ];
    }

    $categories = [];
    if (!empty($row["categories"])) {
        $categories = explode(",", $row["categories"]);
    }

    echo json_encode([
        "status" => "ok",
        "type" => "combo",
        "id" => $row["trip_id"],
        "city_id" => $row["city_id"],
        "name" => $row["name"],
        "description" => "This popular combo includes multiple attractions commonly planned together by users.",
        "image" => $row["image"],
        "location" => $row["city_name"] . ", " . $row["country_name"],
        "categories" => $categories,
        "rating" => $row["rating"],
        "review_count" => $row["review_count"],
        "estimated_price" => $row["estimated_price"],
        "best_season" => "Mixed / Not specified",
        "reviews" => $reviews
    ]);
    exit();
}

echo json_encode(["status" => "error", "message" => "Invalid type"]);
?>