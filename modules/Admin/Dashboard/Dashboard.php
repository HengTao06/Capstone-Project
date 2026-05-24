<?php
header('Content-Type: application/json');

require_once "../../../shared/php/db.php";

if ($conn->connect_error) {
    echo json_encode(["error" => "Database Connection Failed: " . $conn->connect_error]);
    exit();
}

$response = [];

$response['stats'] = [
    'users' => $conn->query("SELECT COUNT(*) as count FROM users")->fetch_assoc()['count'],
    'trips' => $conn->query("SELECT COUNT(*) as count FROM trip")->fetch_assoc()['count'],
    'reviews' => $conn->query("SELECT COUNT(*) as count FROM review")->fetch_assoc()['count'],
    'destinations' => $conn->query("SELECT COUNT(*) as count FROM attraction")->fetch_assoc()['count']
];

$topDestinations = [];
$dest_sql = "SELECT a.attraction_name, c.city_name, co.country_name, a.attraction_image, COUNT(td.trip_details_id) as visits 
             FROM attraction a
             JOIN city c ON a.city_id = c.city_id
             JOIN country co ON c.country_id = co.country_id
             LEFT JOIN trip_details td ON a.attraction_id = td.attraction_id
             GROUP BY a.attraction_id, a.attraction_name, c.city_name, co.country_name, a.attraction_image
             ORDER BY visits DESC 
             LIMIT 4";

$dest_result = $conn->query($dest_sql);
if ($dest_result) {
    while ($row = $dest_result->fetch_assoc()) {
        $image = !empty($row['attraction_image']) ? "../../../assets/images/attraction/" . $row['attraction_image'] : "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=500&auto=format&fit=crop";
        
        $topDestinations[] = [
            "attraction_name" => $row['attraction_name'],
            "location" => $row['city_name'] . ", " . $row['country_name'],
            "attraction_image" => $image,
            "visits" => $row['visits']
        ];
    }
}
$response['topDestinations'] = $topDestinations;

$topReviews = [];
$rev_sql = "SELECT u.username, u.user_profile, a.attraction_name, r.rating, r.review_date, r.photo, r.comment 
            FROM review r
            JOIN users u ON r.user_id = u.user_id
            JOIN attraction a ON r.attraction_id = a.attraction_id
            ORDER BY r.rating DESC, r.review_date DESC 
            LIMIT 2";

$rev_result = $conn->query($rev_sql);
if ($rev_result) {
    while ($row = $rev_result->fetch_assoc()) {
        $user_img = !empty($row['user_profile']) ? "../../../assets/images/profile/" . $row['user_profile'] : "https://ui-avatars.com/api/?name=" . urlencode($row['username']) . "&background=random";
        $review_img = !empty($row['photo']) ? "../../../assets/images/review/" . $row['photo'] : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop";

        $topReviews[] = [
            "user_name" => $row['username'],
            "user_image" => $user_img,
            "attraction_name" => $row['attraction_name'],
            "rating" => $row['rating'],
            "date_posted" => date("M d, Y", strtotime($row['review_date'])),
            "review_image" => $review_img,
            "review_text" => $row['comment']
        ];
    }
}
$response['topReviews'] = $topReviews;

echo json_encode($response);
$conn->close();
?>