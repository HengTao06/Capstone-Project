<?php
header('Content-Type: application/json');

// Link the Shared Database Connection
require_once "../../../shared/php/db.php";

if ($conn->connect_error) {
    echo json_encode(["error" => "Database Connection Failed: " . $conn->connect_error]);
    exit();
}

$response = [];

// 1. Most Popular Destinations (Bar Chart) - LIMITED TO 5
$pop_dest_sql = "SELECT c.city_name, COUNT(t.trip_id) as bookings 
                 FROM trip t
                 JOIN city c ON t.city_id = c.city_id
                 GROUP BY c.city_id, c.city_name
                 ORDER BY bookings DESC 
                 LIMIT 5";
$pop_dest_result = $conn->query($pop_dest_sql);
$popularDestinations = ['labels' => [], 'data' => []];
if ($pop_dest_result) {
    while ($row = $pop_dest_result->fetch_assoc()) {
        $popularDestinations['labels'][] = $row['city_name'];
        $popularDestinations['data'][] = (int)$row['bookings'];
    }
}
$response['popularDestinations'] = $popularDestinations;


// 2. Top Rated Attractions (List) - LIMITED TO 5
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


// 3. Most Common Travel Combos (Pie Chart) - LIMITED TO 5
$combos_sql = "SELECT trip_name, COUNT(trip_id) as bookings
               FROM trip
               GROUP BY trip_name
               ORDER BY bookings DESC
               LIMIT 5";
$combos_result = $conn->query($combos_sql);
$travelCombos = ['labels' => [], 'data' => []];
if ($combos_result) {
    while ($row = $combos_result->fetch_assoc()) {
        $travelCombos['labels'][] = $row['trip_name'];
        $travelCombos['data'][] = (int)$row['bookings'];
    }
}
$response['travelCombos'] = $travelCombos;


// 4. Total Platform Bookings (Line Chart) - DYNAMIC LAST 6 MONTHS
// Step A: Dynamically create an array of the last 6 months (ending in the current month)
$lastSixMonths = [];
for ($i = 5; $i >= 0; $i--) {
    $monthName = date('M', strtotime("-$i months")); 
    $lastSixMonths[$monthName] = 0; 
}

// Step B: Ask the database for bookings in the last 6 months
$bookings_sql = "SELECT DATE_FORMAT(start_date, '%b') as month_name, COUNT(trip_id) as bookings
                 FROM trip
                 WHERE start_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                 GROUP BY month_name";
$bookings_result = $conn->query($bookings_sql);

// Step C: Update our array with the real database numbers
if ($bookings_result) {
    while ($row = $bookings_result->fetch_assoc()) {
        $mName = $row['month_name'];
        // Only update if the month is in our 6-month window
        if (isset($lastSixMonths[$mName])) {
            $lastSixMonths[$mName] = (int)$row['bookings'];
        }
    }
}

// Step D: Format it for Chart.js
$platformBookings = [
    'labels' => array_keys($lastSixMonths), // e.g., ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
    'data' => array_values($lastSixMonths)
];
$response['platformBookings'] = $platformBookings;


echo json_encode($response);
$conn->close();
?>