<?php
require_once "../../../shared/php/db.php";

header("Content-Type: application/json");

$action = $_GET["action"] ?? $_POST["action"] ?? "list";

function uploadImage($oldImage = "") {
    if (isset($_FILES["attraction_image_file"]) && $_FILES["attraction_image_file"]["error"] === 0) {
        $upload_dir = "../../../assets/images/attraction/";
        $ext = strtolower(pathinfo($_FILES["attraction_image_file"]["name"], PATHINFO_EXTENSION));

        $allowed = ["jpg", "jpeg", "png", "webp"];

        if (!in_array($ext, $allowed)) {
            echo json_encode([
                "status" => "error",
                "message" => "Only JPG, JPEG, PNG and WEBP images are allowed."
            ]);
            exit();
        }

        $image = "destination_" . time() . "." . $ext;

        if (!move_uploaded_file($_FILES["attraction_image_file"]["tmp_name"], $upload_dir . $image)) {
            echo json_encode([
                "status" => "error",
                "message" => "Failed to upload image."
            ]);
            exit();
        }

        return $image;
    }

    return $oldImage;
}

/* ============================
   LIST DESTINATIONS
============================ */
if ($_SERVER["REQUEST_METHOD"] === "GET" && $action === "list") {

    $sql = "
        SELECT 
            a.attraction_id,
            a.attraction_name,
            a.attraction_description,
            a.attraction_category,
            a.estimated_price,
            a.best_season,
            a.attraction_image,
            a.city_id,
            c.city_name,
            c.country_id,
            co.country_name,
            IFNULL(ROUND(AVG(r.rating), 1), 0) AS avg_rating
        FROM attraction a
        LEFT JOIN city c 
            ON a.city_id = c.city_id
        LEFT JOIN country co 
            ON c.country_id = co.country_id
        LEFT JOIN review r 
            ON a.attraction_id = r.attraction_id
        GROUP BY 
            a.attraction_id,
            a.attraction_name,
            a.attraction_description,
            a.attraction_category,
            a.estimated_price,
            a.best_season,
            a.attraction_image,
            a.city_id,
            c.city_name,
            c.country_id,
            co.country_name
        ORDER BY a.attraction_id DESC
    ";

    $result = $conn->query($sql);

    $destinations = [];

    while ($row = $result->fetch_assoc()) {
        $destinations[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "destinations" => $destinations
    ]);

    exit();
}

/* ============================
   COUNTRIES
============================ */
if ($_SERVER["REQUEST_METHOD"] === "GET" && $action === "countries") {

    $result = $conn->query("
        SELECT country_id, country_name
        FROM country
        ORDER BY country_name ASC
    ");

    $countries = [];

    while ($row = $result->fetch_assoc()) {
        $countries[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "countries" => $countries
    ]);

    exit();
}

/* ============================
   CITIES BY COUNTRY
============================ */
if ($_SERVER["REQUEST_METHOD"] === "GET" && $action === "cities") {

    $country_id = intval($_GET["country_id"] ?? 0);

    $stmt = $conn->prepare("
        SELECT city_id, city_name
        FROM city
        WHERE country_id = ?
        ORDER BY city_name ASC
    ");

    $stmt->bind_param("i", $country_id);
    $stmt->execute();

    $result = $stmt->get_result();

    $cities = [];

    while ($row = $result->fetch_assoc()) {
        $cities[] = $row;
    }

    $stmt->close();

    echo json_encode([
        "status" => "success",
        "cities" => $cities
    ]);

    exit();
}

/* ============================
   ADD DESTINATION
============================ */
if ($_SERVER["REQUEST_METHOD"] === "POST" && $action === "add") {

    $name = trim($_POST["attraction_name"] ?? "");
    $city_id = intval($_POST["city_id"] ?? 0);
    $category = trim($_POST["attraction_category"] ?? "");
    $estimated_price = floatval($_POST["estimated_price"] ?? 0);
    $best_season = trim($_POST["best_season"] ?? "");
    $description = trim($_POST["attraction_description"] ?? "");

    $image = uploadImage("");

    if (
        $name === "" ||
        $city_id <= 0 ||
        $category === "" ||
        $estimated_price <= 0 ||
        $best_season === "" ||
        $description === "" ||
        $image === ""
    ) {
        echo json_encode([
            "status" => "error",
            "message" => "Please complete all required fields and upload an image."
        ]);
        exit();
    }

    $stmt = $conn->prepare("
        INSERT INTO attraction
            (
                attraction_name,
                attraction_description,
                attraction_category,
                estimated_price,
                best_season,
                attraction_image,
                city_id
            )
        VALUES
            (?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "sssdssi",
        $name,
        $description,
        $category,
        $estimated_price,
        $best_season,
        $image,
        $city_id
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

    $stmt->close();
    exit();
}

/* ============================
   UPDATE DESTINATION
============================ */
if ($_SERVER["REQUEST_METHOD"] === "POST" && $action === "update") {

    $attraction_id = intval($_POST["attraction_id"] ?? 0);
    $name = trim($_POST["attraction_name"] ?? "");
    $city_id = intval($_POST["city_id"] ?? 0);
    $category = trim($_POST["attraction_category"] ?? "");
    $estimated_price = floatval($_POST["estimated_price"] ?? 0);
    $best_season = trim($_POST["best_season"] ?? "");
    $description = trim($_POST["attraction_description"] ?? "");
    $oldImage = trim($_POST["old_image"] ?? "");

    $image = uploadImage($oldImage);

    if (
        $attraction_id <= 0 ||
        $name === "" ||
        $city_id <= 0 ||
        $category === "" ||
        $estimated_price <= 0 ||
        $best_season === "" ||
        $description === "" ||
        $image === ""
    ) {
        echo json_encode([
            "status" => "error",
            "message" => "Please complete all required fields."
        ]);
        exit();
    }

    $stmt = $conn->prepare("
        UPDATE attraction
        SET
            attraction_name = ?,
            attraction_description = ?,
            attraction_category = ?,
            estimated_price = ?,
            best_season = ?,
            attraction_image = ?,
            city_id = ?
        WHERE attraction_id = ?
    ");

    $stmt->bind_param(
        "sssdssii",
        $name,
        $description,
        $category,
        $estimated_price,
        $best_season,
        $image,
        $city_id,
        $attraction_id
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

    $stmt->close();
    exit();
}

/* ============================
   DELETE DESTINATION
============================ */
if ($_SERVER["REQUEST_METHOD"] === "POST" && $action === "delete") {

    $attraction_id = intval($_POST["attraction_id"] ?? 0);

    if ($attraction_id <= 0) {
        echo json_encode([
            "status" => "error",
            "message" => "Invalid destination ID."
        ]);
        exit();
    }

    $stmt = $conn->prepare("
        DELETE FROM attraction
        WHERE attraction_id = ?
    ");

    $stmt->bind_param("i", $attraction_id);

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

    $stmt->close();
    exit();
}

echo json_encode([
    "status" => "error",
    "message" => "Invalid request."
]);
?>