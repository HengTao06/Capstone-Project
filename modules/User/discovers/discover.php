<?php

require_once '../../../shared/php/db.php';   // adjust path if needed
require_once "../../../shared/php/session.php";

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$action = $_GET['action'] ?? '';

try {
    $pdo = getDBConnection();          // uses your existing db.php helper
    // ── if your db.php uses a global $conn (mysqli), swap to that below ──

    switch ($action) {

        /* ================================================
           GET COUNTRIES
           ================================================ */
        case 'get_countries':
            $stmt = $pdo->query("SELECT country_id, country_name FROM country ORDER BY country_name");
            echo json_encode([
                'status'    => 'ok',
                'countries' => $stmt->fetchAll(PDO::FETCH_ASSOC)
            ]);
            break;

        /* ================================================
           GET ATTRACTION CATEGORIES
           ================================================ */
        case 'get_categories':
            $stmt = $pdo->query(
                "SELECT DISTINCT attraction_category
                 FROM attraction
                 WHERE attraction_category IS NOT NULL
                 ORDER BY attraction_category"
            );
            $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
            echo json_encode(['status' => 'ok', 'categories' => $rows]);
            break;

        /* ================================================
           GET RECOMMENDED ATTRACTIONS
           (sorted by avg rating DESC, with optional filters)
           ================================================ */
        case 'get_recommended':
            $where  = [];
            $params = [];

            // --- Budget filter (uses estimated_price) ---
            $budget = $_GET['budget'] ?? '';
            if ($budget === 'low') {
                $where[]  = 'a.estimated_price < 200';
            } elseif ($budget === 'mid') {
                $where[]  = 'a.estimated_price BETWEEN 200 AND 500';
            } elseif ($budget === 'high') {
                $where[]  = 'a.estimated_price > 500';
            }

            // --- Country filter ---
            $country = $_GET['country'] ?? '';
            if ($country !== '') {
                $where[]    = 'c.country_id = :country_id';
                $params[':country_id'] = (int)$country;
            }

            // --- Travel interests (categories) ---
            $interests = $_GET['interests'] ?? '';
            if ($interests !== '') {
                $cats   = array_filter(array_map('trim', explode(',', $interests)));
                if ($cats) {
                    $placeholders = implode(',', array_fill(0, count($cats), '?'));
                    $where[] = "a.attraction_category IN ($placeholders)";
                    $params  = array_merge(array_values($params), array_values($cats));
                }
            }

            // --- Min rating filter ---
            $minRating = (float)($_GET['min_rating'] ?? 0);
            if ($minRating > 0) {
                $where[] = 'COALESCE(AVG(r.rating), 0) >= :min_rating';
                $params[':min_rating'] = $minRating;
            }

            $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

            // Build query — join city→country for country filter
            $sql = "
                SELECT
                    a.attraction_id,
                    a.attraction_name,
                    a.attraction_description,
                    a.attraction_category,
                    a.estimated_price,
                    a.attraction_image,
                    ci.city_name,
                    co.country_name,
                    ROUND(AVG(r.rating), 1) AS avg_rating,
                    COUNT(r.review_id) AS review_count
                FROM attraction a
                LEFT JOIN city    ci ON a.city_id      = ci.city_id
                LEFT JOIN country co ON ci.country_id  = co.country_id
                LEFT JOIN review  r  ON a.attraction_id = r.attraction_id
                $whereSql
                GROUP BY
                    a.attraction_id, a.attraction_name, a.attraction_description,
                    a.attraction_category, a.estimated_price, a.attraction_image,
                    ci.city_name, co.country_name
                HAVING 1=1
                " . ($minRating > 0 ? "AND ROUND(AVG(r.rating),1) >= $minRating" : '') . "
                ORDER BY avg_rating DESC, review_count DESC
                LIMIT 30
            ";

            // Use positional params if we have the interests array mixed in
            if (isset($params[':country_id']) || isset($params[':min_rating'])) {
                $stmt = $pdo->prepare($sql);
                foreach ($params as $k => $v) {
                    if (is_int($k)) {
                        $stmt->bindValue($k + 1, $v);
                    } else {
                        $stmt->bindValue($k, $v);
                    }
                }
                $stmt->execute();
            } else {
                // Positional only (interests)
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array_values($params));
            }

            echo json_encode([
                'status'      => 'ok',
                'attractions' => $stmt->fetchAll(PDO::FETCH_ASSOC)
            ]);
            break;

        /* ================================================
           GET POPULAR COMBOS
           (trips that have been used / booked most)
           ================================================ */
        case 'get_combos':
            /*
             * A "combo" here is defined as a trip that visits multiple
             * attractions across multiple cities.  We join trip → trip_details
             * → attraction → city to build a summary per trip.
             *
             * We expose only trips that have ≥ 2 distinct cities (multi-city
             * combos) and order by how many times that city combo appears.
             */
            $sql = "
                SELECT
                    t.trip_id,
                    t.trip_name AS combo_name,
                    DATEDIFF(t.end_date, t.start_date) + 1 AS total_days,
                    GROUP_CONCAT(DISTINCT ci.city_name
                                 ORDER BY ci.city_name
                                 SEPARATOR ' + ') AS cities,
                    GROUP_CONCAT(DISTINCT a.attraction_category
                                 ORDER BY a.attraction_category
                                 SEPARATOR ',') AS categories,
                    SUM(a.estimated_price) AS total_price,
                    MIN(a.attraction_image) AS image,
                    COUNT(td.trip_details_id) AS stop_count
                FROM trip t
                JOIN trip_details td ON t.trip_id      = td.trip_id
                JOIN attraction   a  ON td.attraction_id = a.attraction_id
                JOIN city         ci ON a.city_id        = ci.city_id
                WHERE t.trip_status IN ('Planned','Completed')
                GROUP BY
                    t.trip_id, t.trip_name, t.start_date, t.end_date
                HAVING COUNT(DISTINCT ci.city_id) >= 1
                ORDER BY stop_count DESC, total_days DESC
                LIMIT 12
            ";

            $stmt = $pdo->query($sql);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Add a sequential index so JS can pick badge variant
            foreach ($rows as $i => &$row) {
                $row['combo_index'] = $i;
            }

            echo json_encode(['status' => 'ok', 'combos' => $rows]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Unknown action']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
