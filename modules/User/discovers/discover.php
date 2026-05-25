<?php
require_once "../../../shared/php/db.php";

header("Content-Type: application/json");

$action = $_GET["action"] ?? "";

if ($action === "get_countries") {
    $sql = "SELECT country_id, country_name FROM country ORDER BY country_name ASC";
    $result = $conn->query($sql);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(["status" => "ok", "countries" => $data]);
    exit();
}

if ($action === "get_categories") {
    $sql = "
        SELECT DISTINCT attraction_category 
        FROM attraction 
        WHERE attraction_category IS NOT NULL 
        AND attraction_category != ''
        ORDER BY attraction_category ASC
    ";

    $result = $conn->query($sql);

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row["attraction_category"];
    }

    echo json_encode(["status" => "ok", "categories" => $data]);
    exit();
}

/* =============================
   RECOMMENDED
============================= */
if ($action === "get_recommended") {
    $search = $_GET["q"] ?? "";
    $city_id = $_GET["city_id"] ?? "";
    $country = $_GET["country"] ?? "";
    $interests = $_GET["interests"] ?? "";
    $budget = $_GET["budget"] ?? "";
    $minRating = $_GET["min_rating"] ?? "";

    $sql = "
        SELECT
            a.attraction_id,
            a.attraction_name,
            a.attraction_description,
            a.attraction_image,
            a.attraction_category,
            a.estimated_price,
            c.city_id,
            c.city_name,
            co.country_id,
            co.country_name,
            ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating,
            COUNT(r.review_id) AS review_count
        FROM attraction a
        JOIN city c ON a.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        LEFT JOIN review r ON a.attraction_id = r.attraction_id
        WHERE 1
    ";

    if ($city_id !== "") {
        $sql .= " AND c.city_id = " . (int)$city_id;
    }

    if ($country !== "") {
        $sql .= " AND co.country_id = " . (int)$country;
    }

    if ($budget === "low") {
        $sql .= " AND COALESCE(a.estimated_price, 0) < 2000";
    } elseif ($budget === "mid") {
        $sql .= " AND COALESCE(a.estimated_price, 0) BETWEEN 2000 AND 5000";
    } elseif ($budget === "high") {
        $sql .= " AND COALESCE(a.estimated_price, 0) > 5000";
    }

    if ($search !== "") {
        $search = $conn->real_escape_string($search);
        $sql .= " AND (
            a.attraction_name LIKE '%$search%' OR
            a.attraction_category LIKE '%$search%' OR
            c.city_name LIKE '%$search%' OR
            co.country_name LIKE '%$search%'
        )";
    }

    if ($interests !== "") {
        $categories = explode(",", $interests);
        $safeCategories = [];

        foreach ($categories as $cat) {
            $cat = trim($cat);
            if ($cat !== "") {
                $safeCategories[] = "'" . $conn->real_escape_string($cat) . "'";
            }
        }

        if (!empty($safeCategories)) {
            $sql .= " AND a.attraction_category IN (" . implode(",", $safeCategories) . ")";
        }
    }

    $sql .= "
        GROUP BY 
            a.attraction_id,
            a.attraction_name,
            a.attraction_description,
            a.attraction_image,
            a.attraction_category,
            a.estimated_price,
            c.city_id,
            c.city_name,
            co.country_id,
            co.country_name
    ";

    if ($minRating !== "" && (float)$minRating > 0) {
        $sql .= " HAVING avg_rating >= " . (float)$minRating;
    }

    $sql .= "
        ORDER BY avg_rating DESC, review_count DESC, a.attraction_name ASC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit();
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(["status" => "ok", "attractions" => $data]);
    exit();
}

/* =============================
   POPULAR COMBO
============================= */
if ($action === "get_combos") {
    $search = $_GET["q"] ?? "";
    $city_id = $_GET["city_id"] ?? "";
    $country = $_GET["country"] ?? "";
    $interests = $_GET["interests"] ?? "";
    $budget = $_GET["budget"] ?? "";
    $minRating = $_GET["min_rating"] ?? "";

    $sql = "
        SELECT
            t.trip_id,
            c.city_id,
            c.city_name,
            co.country_id,
            co.country_name,
            COUNT(DISTINCT td.attraction_id) AS stop_count,
            GROUP_CONCAT(DISTINCT a.attraction_name ORDER BY a.attraction_name SEPARATOR ' + ') AS combo_name,
            GROUP_CONCAT(DISTINCT a.attraction_category ORDER BY a.attraction_category SEPARATOR ', ') AS categories,
            MIN(a.attraction_image) AS image,
            SUM(COALESCE(a.estimated_price, 0)) AS total_price,
            ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating,
            COUNT(r.review_id) AS review_count
        FROM trip_details td
        JOIN trip t ON td.trip_id = t.trip_id
        JOIN attraction a ON td.attraction_id = a.attraction_id
        JOIN city c ON t.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        LEFT JOIN review r ON a.attraction_id = r.attraction_id
        WHERE 1
    ";

    if ($city_id !== "") {
        $sql .= " AND c.city_id = " . (int)$city_id;
    }

    if ($country !== "") {
        $sql .= " AND co.country_id = " . (int)$country;
    }

    if ($search !== "") {
        $search = $conn->real_escape_string($search);
        $sql .= " AND (
            t.trip_name LIKE '%$search%' OR
            a.attraction_name LIKE '%$search%' OR
            a.attraction_category LIKE '%$search%' OR
            c.city_name LIKE '%$search%' OR
            co.country_name LIKE '%$search%'
        )";
    }

    if ($interests !== "") {
        $categories = explode(",", $interests);
        $safeCategories = [];

        foreach ($categories as $cat) {
            $cat = trim($cat);
            if ($cat !== "") {
                $safeCategories[] = "'" . $conn->real_escape_string($cat) . "'";
            }
        }

        if (!empty($safeCategories)) {
            $sql .= " AND a.attraction_category IN (" . implode(",", $safeCategories) . ")";
        }
    }

    $sql .= "
        GROUP BY 
            t.trip_id,
            c.city_id,
            c.city_name,
            co.country_id,
            co.country_name
        HAVING stop_count >= 2
    ";

    if ($budget === "low") {
        $sql .= " AND total_price < 2000";
    } elseif ($budget === "mid") {
        $sql .= " AND total_price BETWEEN 2000 AND 5000";
    } elseif ($budget === "high") {
        $sql .= " AND total_price > 5000";
    }

    if ($minRating !== "" && (float)$minRating > 0) {
        $sql .= " AND avg_rating >= " . (float)$minRating;
    }

    $sql .= "
        ORDER BY stop_count DESC, avg_rating DESC, review_count DESC
        LIMIT 30
    ";

    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode(["status" => "error", "message" => $conn->error]);
        exit();
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode(["status" => "ok", "combos" => $data]);
    exit();
}

echo json_encode([
    "status" => "error",
    "message" => "Invalid action"
]);
?>