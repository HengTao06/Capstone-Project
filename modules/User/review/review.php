<?php
require_once '../../../shared/php/session.php';
require_once '../../../shared/php/db.php';

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit();
}

$user_id = $_SESSION['user_id'];
header('Content-Type: application/json');

// ===========================
// GET - Load reviews and trips
// ===========================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? 'reviews';

    // Load all reviews
    if ($action === 'reviews') {
        $stmt = $conn->prepare("
            SELECT r.review_id, r.rating, r.comment, r.photo, r.review_date,
                   u.username, a.attraction_name
            FROM review r
            JOIN users u ON r.user_id = u.user_id
            JOIN attraction a ON r.attraction_id = a.attraction_id
            ORDER BY r.review_date DESC
        ");
        $stmt->execute();
        $result = $stmt->get_result();
        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
        $stmt->close();

        echo json_encode(['status' => 'success', 'reviews' => $reviews]);
        exit();
    }

    // Load completed trips for logged in user
    if ($action === 'trips') {
        $stmt = $conn->prepare("
            SELECT t.trip_id, t.trip_name, c.city_name
            FROM trip t
            JOIN city c ON t.city_id = c.city_id
            WHERE t.user_id = ? AND t.trip_status = 'Completed'
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $trips = [];
        while ($row = $result->fetch_assoc()) {
            $trips[] = $row;
        }
        $stmt->close();

        echo json_encode(['status' => 'success', 'trips' => $trips]);
        exit();
    }

    // Load attractions for a trip
    if ($action === 'attractions') {
        $trip_id = $_GET['trip_id'] ?? 0;
        $stmt = $conn->prepare("
            SELECT a.attraction_id, a.attraction_name
            FROM trip_details td
            JOIN attraction a ON td.attraction_id = a.attraction_id
            WHERE td.trip_id = ?
        ");
        $stmt->bind_param("i", $trip_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $attractions = [];
        while ($row = $result->fetch_assoc()) {
            $attractions[] = $row;
        }
        $stmt->close();

        echo json_encode(['status' => 'success', 'attractions' => $attractions]);
        exit();
    }
}

// ===========================
// POST - Submit review
// ===========================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $attraction_id = $_POST['attraction_id'] ?? 0;
    $rating = $_POST['rating'] ?? 0;
    $comment = trim($_POST['comment'] ?? '');
    $photo_name = null;

    if (empty($attraction_id) || empty($rating) || empty($comment)) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
        exit();
    }

    // Handle photo upload
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === 0) {
        $upload_dir = '../../../assets/images/';
        $file_ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $photo_name = 'review_' . $user_id . '_' . time() . '.' . $file_ext;
        move_uploaded_file($_FILES['photo']['tmp_name'], $upload_dir . $photo_name);
    }

    $stmt = $conn->prepare("
        INSERT INTO review (user_id, attraction_id, rating, comment, photo, review_date)
        VALUES (?, ?, ?, ?, ?, CURDATE())
    ");
    $stmt->bind_param("iiiss", $user_id, $attraction_id, $rating, $comment, $photo_name);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['status' => 'success', 'message' => 'Review submitted!']);
    exit();
}
?>