<?php
require_once "../../../shared/php/db.php";

header("Content-Type: application/json");

$action = $_GET["action"] ?? $_POST["action"] ?? "list";

/* =========================
   LOAD REVIEWS
========================= */
if ($_SERVER["REQUEST_METHOD"] === "GET" && $action === "list") {

    $sql = "
        SELECT 
            r.review_id,
            r.user_id,
            r.attraction_id,
            r.rating,
            r.comment,
            r.photo,
            r.review_date,

            u.username,
            u.user_profile,

            a.attraction_name,
            a.attraction_image,
            a.attraction_category,

            c.city_name,
            co.country_name

        FROM review r

        INNER JOIN users u
            ON r.user_id = u.user_id

        INNER JOIN attraction a
            ON r.attraction_id = a.attraction_id

        LEFT JOIN city c
            ON a.city_id = c.city_id

        LEFT JOIN country co
            ON c.country_id = co.country_id

        ORDER BY r.review_date DESC, r.review_id DESC
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

    echo json_encode([
        "status" => "success",
        "reviews" => $reviews
    ]);

    exit();
}

/* =========================
   DELETE REVIEW
========================= */
if ($_SERVER["REQUEST_METHOD"] === "POST" && $action === "delete") {

    $review_id = intval($_POST["review_id"] ?? 0);

    if ($review_id <= 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid review ID."
        ]);
        exit();
    }

    $stmt = $conn->prepare("
        DELETE FROM review
        WHERE review_id = ?
    ");

    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit();
    }

    $stmt->bind_param("i", $review_id);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Review deleted successfully."
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete review."
        ]);
    }

    $stmt->close();
    exit();
}

echo json_encode([
    "status" => "error",
    "message" => "Invalid request."
]);
?>