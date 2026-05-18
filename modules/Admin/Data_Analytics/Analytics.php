<?php
header('Content-Type: application/json');

require_once "../../../shared/php/db.php";

if ($conn->connect_error) {
    echo json_encode(["error" => "Database Connection Failed: " . $conn->connect_error]);
    exit();
}

$response = [];

$pop_dest_sql = "SELECT c.city_name, COUNT(t.trip_id) as trips_count 
                 FROM trip t
                 JOIN city c ON t.city_id = c.city_id
                 GROUP BY c.city_id, c.city_name
                 ORDER BY trips_count DESC 
                 LIMIT 5";
$pop_dest_result = $conn->query($pop_dest_sql);
$popularDestinations = ['labels' => [], 'data' => []];
if ($pop_dest_result) {
    while ($row = $pop_dest_result->fetch_assoc()) {
        $popularDestinations['labels'][] = $row['city_name'];
        $popularDestinations['data'][] = (int)$row['trips_count'];
    }
}
$response['popularDestinations'] = $popularDestinations;


$top_rated_sql = "SELECT a.attraction_name, ROUND(AVG(r.rating), 1) as avg_rating, COUNT(r.review_id) as review_count
                  FROM attraction a
                  JOIN review r ON a.attraction_id = r.attraction_id
                  GROUP BY a.attraction_id, a.attraction_name
                  ORDER BY avg_rating DESC, review_count DESC
                  LIMIT 5";
$top_rated_result = $conn->query($top_rated_sql);
$topRated = [];
if ($top_rated_result) {
    while ($row = $top_rated_result->fetch_assoc()) {
        $topRated[] = [
            "name" => $row['attraction_name'],
            "rating" => $row['avg_rating'],
            "reviews" => $row['review_count']
        ];
    }
}
$response['topRated'] = $topRated;


$combos_sql = "SELECT co.country_name, t.trip_name, COUNT(t.trip_id) as trips_count
               FROM trip t
               JOIN city c ON t.city_id = c.city_id
               JOIN country co ON c.country_id = co.country_id
               GROUP BY co.country_name, t.trip_name
               ORDER BY co.country_name, trips_count DESC";
$combos_result = $conn->query($combos_sql);
$travelCombos = [];
if ($combos_result) {
    while ($row = $combos_result->fetch_assoc()) {
        $country = $row['country_name'];
        if (!isset($travelCombos[$country])) {
            $travelCombos[$country] = ['labels' => [], 'data' => []];
        }
        if (count($travelCombos[$country]['labels']) < 5) {
            $travelCombos[$country]['labels'][] = $row['trip_name'];
            $travelCombos[$country]['data'][] = (int)$row['trips_count'];
        }
    }
}
$response['travelCombos'] = $travelCombos;


$lastSixMonths = [];
for ($i = 5; $i >= 0; $i--) {
    $monthName = date('M', strtotime("-$i months")); 
    $lastSixMonths[$monthName] = 0; 
}

$trips_sql = "SELECT DATE_FORMAT(start_date, '%b') as month_name, COUNT(trip_id) as trips_count
                 FROM trip
                 WHERE start_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                 GROUP BY month_name";
$trips_result = $conn->query($trips_sql);

if ($trips_result) {
    while ($row = $trips_result->fetch_assoc()) {
        $mName = $row['month_name'];
        if (isset($lastSixMonths[$mName])) {
            $lastSixMonths[$mName] = (int)$row['trips_count'];
        }
    }
}

$platformTrips = [
    'labels' => array_keys($lastSixMonths), 
    'data' => array_values($lastSixMonths)
];
$response['platformTrips'] = $platformTrips;

echo json_encode($response);
$conn->close();
?>