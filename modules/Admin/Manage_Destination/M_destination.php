<?php
require_once "../../../shared/php/db.php";

header("Content-Type: application/json");

$action = $_GET["action"] ?? "list";

/* =========================
   GET CITIES
========================= */
if ($action === "cities") {
    $sql = "
        SELECT 
            city.city_id,
            city.city_name,
            country.country_name
        FROM city
        JOIN country 
            ON city.country_id = country.country_id
        ORDER BY country.country_name ASC, city.city_name ASC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode([]);
        exit();
    }

    $cities = [];

    while ($row = $result->fetch_assoc()) {
        $cities[] = $row;
    }

    echo json_encode($cities);
    exit();
}

/* =========================
   LIST DESTINATIONS
========================= */
if ($action === "list") {
    $sql = "
        SELECT
            attraction.attraction_id,
            attraction.city_id,
            attraction.attraction_name,
            attraction.attraction_description,
            attraction.attraction_category,
            attraction.attraction_image,
            attraction.estimated_price,
            attraction.best_season,
            city.city_name,
            country.country_name
        FROM attraction
        JOIN city
            ON attraction.city_id = city.city_id
        JOIN country
            ON city.country_id = country.country_id
        ORDER BY attraction.attraction_id DESC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode([]);
        exit();
    }

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
    exit();
}

/* =========================
   ADD DESTINATION
========================= */
if ($action === "add") {
    $input = json_decode(file_get_contents("php://input"), true);

    $name = trim($input["attraction_name"] ?? "");
    $cityId = (int)($input["city_id"] ?? 0);
    $category = trim($input["attraction_category"] ?? "");
    $description = trim($input["attraction_description"] ?? "");
    $image = trim($input["attraction_image"] ?? "");
    $price = (float)($input["estimated_price"] ?? 0);
    $season = trim($input["best_season"] ?? "");

    if ($name === "" || $cityId <= 0 || $category === "") {
        echo json_encode([
            "status" => "error",
            "message" => "Please fill in name, city and category."
        ]);
        exit();
    }

    $stmt = $conn->prepare("
        INSERT INTO attraction
        (
            city_id,
            attraction_name,
            attraction_description,
            attraction_category,
            attraction_image,
            estimated_price,
            best_season
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit();
    }

    $stmt->bind_param(
        "issssds",
        $cityId,
        $name,
        $description,
        $category,
        $image,
        $price,
        $season
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Destination added successfully."
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to add destination."
        ]);
    }

    exit();
}

/* =========================
   UPDATE DESTINATION
========================= */
if ($action === "update") {
    $input = json_decode(file_get_contents("php://input"), true);

    $id = (int)($input["attraction_id"] ?? 0);
    $name = trim($input["attraction_name"] ?? "");
    $cityId = (int)($input["city_id"] ?? 0);
    $category = trim($input["attraction_category"] ?? "");
    $description = trim($input["attraction_description"] ?? "");
    $image = trim($input["attraction_image"] ?? "");
    $price = (float)($input["estimated_price"] ?? 0);
    $season = trim($input["best_season"] ?? "");

    if ($id <= 0 || $name === "" || $cityId <= 0 || $category === "") {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid destination data."
        ]);
        exit();
    }

    $stmt = $conn->prepare("
        UPDATE attraction
        SET
            city_id = ?,
            attraction_name = ?,
            attraction_description = ?,
            attraction_category = ?,
            attraction_image = ?,
            estimated_price = ?,
            best_season = ?
        WHERE attraction_id = ?
    ");

    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit();
    }

    $stmt->bind_param(
        "issssdsi",
        $cityId,
        $name,
        $description,
        $category,
        $image,
        $price,
        $season,
        $id
    );

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Destination updated successfully."
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to update destination."
        ]);
    }

    exit();
}

/* =========================
   DELETE DESTINATION
========================= */
if ($action === "delete") {
    $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

    if ($id <= 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid destination ID."
        ]);
        exit();
    }

    $stmt = $conn->prepare("DELETE FROM attraction WHERE attraction_id = ?");

    if (!$stmt) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit();
    }

    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Destination deleted successfully."
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Failed to delete destination. It may be used in trips or reviews."
        ]);
    }

    exit();
}

echo json_encode([
    "status" => "error",
    "message" => "Invalid action."
]);
?>