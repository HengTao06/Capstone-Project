<?php

require_once "../../../shared/php/db.php";
require_once "../../../shared/php/session.php";

header('Content-Type: application/json');
$action = $_GET["action"] ?? "";

// GET USER STATS
if($action === "stats") {

    $user_id = $_GET["user_id"];

    // TOTAL TRIPS
    $tripSql = "
    SELECT COUNT(*) AS total_trips
    FROM trip
    WHERE user_id = ?
    ";

    $stmt =
    mysqli_prepare($conn, $tripSql);

    mysqli_stmt_bind_param(
        $stmt,
        "i",
        $user_id
    );

    mysqli_stmt_execute($stmt);

    $tripResult =
    mysqli_stmt_get_result($stmt);

    $tripData =
    mysqli_fetch_assoc($tripResult);

    // TOTAL REVIEWS

    $reviewSql = "
    SELECT COUNT(*) AS total_reviews
    FROM review
    WHERE user_id = ?
    ";

    $stmt =
    mysqli_prepare($conn, $reviewSql);

    mysqli_stmt_bind_param(
        $stmt,
        "i",
        $user_id
    );

    mysqli_stmt_execute($stmt);

    $reviewResult =
    mysqli_stmt_get_result($stmt);

    $reviewData =
    mysqli_fetch_assoc($reviewResult);

    echo json_encode([

        "trips" =>
            $tripData["total_trips"],

        "reviews" =>
            $reviewData["total_reviews"]

    ]);

    exit;
}

$sql = "SELECT * FROM users";
$result = mysqli_query($conn, $sql);

$users = [];

while($row = mysqli_fetch_assoc($result)) {
    $users[] = $row;
}

echo json_encode($users);

?>