<?php
require_once '../../../shared/php/session.php';
require_once '../../../shared/php/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Not logged in'
    ]);
    exit();
}

$user_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? $_POST['action'] ?? 'reviews';

/* ===========================
   GET REQUESTS
=========================== */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    /* LOAD ALL REVIEWS */
    if ($action === 'reviews') {
        $stmt = $conn->prepare("
            SELECT 
                r.review_id,
                r.rating,
                r.comment,
                r.photo,
                r.review_date,
                u.username,
                u.user_profile,
                a.attraction_name
            FROM review r
            INNER JOIN users u 
                ON r.user_id = u.user_id
            INNER JOIN attraction a 
                ON r.attraction_id = a.attraction_id
            ORDER BY r.review_date DESC, r.review_id DESC
        ");

        $stmt->execute();
        $result = $stmt->get_result();

        $reviews = [];

        while ($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }

        $stmt->close();

        echo json_encode([
            'status' => 'success',
            'reviews' => $reviews
        ]);
        exit();
    }

    /* LOAD COMPLETED TRIPS FOR CURRENT USER */
    if ($action === 'trips') {
        $stmt = $conn->prepare("
            SELECT 
                t.trip_id,
                t.trip_name,
                c.city_name,
                co.country_name
            FROM trip t
            INNER JOIN city c 
                ON t.city_id = c.city_id
            INNER JOIN country co
                ON c.country_id = co.country_id
            WHERE t.user_id = ?
            AND t.trip_status = 'Completed'
            ORDER BY t.trip_id DESC
        ");

        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $trips = [];

        while ($row = $result->fetch_assoc()) {
            $trips[] = $row;
        }

        $stmt->close();

        echo json_encode([
            'status' => 'success',
            'trips' => $trips
        ]);
        exit();
    }

    /* LOAD ATTRACTIONS FROM SELECTED COMPLETED TRIP */
    if ($action === 'attractions') {
        $trip_id = intval($_GET['trip_id'] ?? 0);

        if ($trip_id <= 0) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid trip ID'
            ]);
            exit();
        }

        $stmt = $conn->prepare("
            SELECT DISTINCT
                a.attraction_id,
                a.attraction_name
            FROM trip_details td
            INNER JOIN trip t
                ON td.trip_id = t.trip_id
            INNER JOIN attraction a
                ON td.attraction_id = a.attraction_id
            WHERE td.trip_id = ?
            AND t.user_id = ?
            AND t.trip_status = 'Completed'
            ORDER BY a.attraction_name ASC
        ");

        $stmt->bind_param("ii", $trip_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $attractions = [];

        while ($row = $result->fetch_assoc()) {
            $attractions[] = $row;
        }

        $stmt->close();

        echo json_encode([
            'status' => 'success',
            'attractions' => $attractions
        ]);
        exit();
    }
}

/* ===========================
   POST - SUBMIT REVIEW
=========================== */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $attraction_id = intval($_POST['attraction_id'] ?? 0);
    $rating = intval($_POST['rating'] ?? 0);
    $comment = trim($_POST['comment'] ?? '');
    $photo_name = null;

    /* VALIDATION */
    if ($attraction_id <= 0 || $rating <= 0 || $comment === '') {

        echo json_encode([
            'status' => 'error',
            'message' => 'All required fields must be completed'
        ]);

        exit();
    }

    if ($rating < 1 || $rating > 5) {

        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid rating value'
        ]);

        exit();
    }

    /* VERIFY USER COMPLETED THIS ATTRACTION */
    $verify = $conn->prepare("
        SELECT td.attraction_id
        FROM trip_details td
        INNER JOIN trip t
            ON td.trip_id = t.trip_id
        WHERE td.attraction_id = ?
        AND t.user_id = ?
        AND t.trip_status = 'Completed'
        LIMIT 1
    ");

    $verify->bind_param("ii", $attraction_id, $user_id);
    $verify->execute();

    $verify_result = $verify->get_result();

    if ($verify_result->num_rows === 0) {

        echo json_encode([
            'status' => 'error',
            'message' => 'You can only review attractions from completed trips'
        ]);

        exit();
    }

    $verify->close();

    /* PREVENT DUPLICATE REVIEW */
    $check = $conn->prepare("
        SELECT review_id
        FROM review
        WHERE user_id = ?
        AND attraction_id = ?
        LIMIT 1
    ");

    $check->bind_param("ii", $user_id, $attraction_id);
    $check->execute();

    $check_result = $check->get_result();

    if ($check_result->num_rows > 0) {

        echo json_encode([
            'status' => 'error',
            'message' => 'You have already reviewed this attraction'
        ]);

        exit();
    }

    $check->close();

    /* PHOTO UPLOAD */
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === 0) {

        $allowed_ext = ['jpg', 'jpeg', 'png', 'webp'];

        $file_ext = strtolower(
            pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION)
        );

        if (!in_array($file_ext, $allowed_ext)) {

            echo json_encode([
                'status' => 'error',
                'message' => 'Only JPG, JPEG, PNG and WEBP images are allowed'
            ]);

            exit();
        }

        /* FILE SIZE VALIDATION */
        $maxSize = 20 * 1024 * 1024;

        if ($_FILES['photo']['size'] > $maxSize) {

            echo json_encode([
                'status' => 'error',
                'message' => 'Image size must not exceed 20MB'
            ]);

            exit();
        }

        $upload_dir = '../../../assets/images/review/';

        $photo_name =
            'review_' .
            $user_id .
            '_' .
            time() .
            '.' .
            $file_ext;

        $upload_path = $upload_dir . $photo_name;

        if (!move_uploaded_file(
            $_FILES['photo']['tmp_name'],
            $upload_path
        )) {

            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to upload photo'
            ]);

            exit();
        }
    }

    /* INSERT REVIEW */
    $stmt = $conn->prepare("
        INSERT INTO review
            (
                user_id,
                attraction_id,
                rating,
                comment,
                photo,
                review_date
            )
        VALUES
            (?, ?, ?, ?, ?, CURDATE())
    ");

    $stmt->bind_param(
        "iiiss",
        $user_id,
        $attraction_id,
        $rating,
        $comment,
        $photo_name
    );

    if ($stmt->execute()) {

        echo json_encode([
            'status' => 'success',
            'message' => 'Review submitted successfully'
        ]);

    } else {

        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to submit review'
        ]);
    }

    $stmt->close();

    exit();
}
?>