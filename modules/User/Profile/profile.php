<?php

require_once '../../../shared/php/session.php';
require_once '../../../shared/php/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User not logged in'
    ]);
    exit();
}

$user_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ===============================
// GET PROFILE + COMPLETED TRIPS
// ===============================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get_profile') {

    $stmt = $conn->prepare("
        SELECT username, user_email, user_profile, user_password
        FROM users
        WHERE user_id = ?
    ");

    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $user_result = $stmt->get_result();
    $user = $user_result->fetch_assoc();
    $stmt->close();

    if (!$user) {
        echo json_encode([
            'status' => 'error',
            'message' => 'User not found'
        ]);
        exit();
    }

    $trip_stmt = $conn->prepare("
        SELECT 
            t.trip_id,
            t.trip_name,
            t.start_date,
            t.end_date,
            c.city_name,
            co.country_name,
            MIN(a.attraction_image) AS trip_image,
            COUNT(td.attraction_id) AS total_attractions

        FROM trip t

        INNER JOIN city c
            ON t.city_id = c.city_id

        INNER JOIN country co
            ON c.country_id = co.country_id

        LEFT JOIN trip_details td
            ON t.trip_id = td.trip_id

        LEFT JOIN attraction a
            ON td.attraction_id = a.attraction_id

        WHERE t.user_id = ?
        AND t.trip_status = 'Completed'

        GROUP BY 
            t.trip_id,
            t.trip_name,
            t.start_date,
            t.end_date,
            c.city_name,
            co.country_name

        ORDER BY t.trip_id DESC
    ");

    $trip_stmt->bind_param("i", $user_id);
    $trip_stmt->execute();
    $trip_result = $trip_stmt->get_result();

    $trips = [];

    while ($row = $trip_result->fetch_assoc()) {
        $trips[] = $row;
    }

    $trip_stmt->close();

    echo json_encode([
        'status' => 'success',
        'user' => [
            'username' => $user['username'],
            'email' => $user['user_email'],
            'profile_photo' => $user['user_profile'],
            'password' => $user['user_password']
        ],
        'trips' => $trips
    ]);

    exit();
}

// ===============================
// GET SINGLE COMPLETED TRIP DETAIL
// ===============================
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get_trip_detail') {

    $trip_id = intval($_GET['trip_id'] ?? 0);

    if ($trip_id <= 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid trip ID'
        ]);
        exit();
    }

    $trip_stmt = $conn->prepare("
        SELECT 
            t.trip_id,
            t.trip_name,
            t.start_date,
            t.end_date,
            c.city_name,
            co.country_name,
            MIN(a.attraction_image) AS trip_image
        FROM trip t
        INNER JOIN city c 
            ON t.city_id = c.city_id
        INNER JOIN country co 
            ON c.country_id = co.country_id
        LEFT JOIN trip_details td 
            ON t.trip_id = td.trip_id
        LEFT JOIN attraction a 
            ON td.attraction_id = a.attraction_id
        WHERE t.trip_id = ?
        AND t.user_id = ?
        AND t.trip_status = 'Completed'
        GROUP BY 
            t.trip_id,
            t.trip_name,
            t.start_date,
            t.end_date,
            c.city_name,
            co.country_name
    ");

    $trip_stmt->bind_param("ii", $trip_id, $user_id);
    $trip_stmt->execute();
    $trip_result = $trip_stmt->get_result();
    $trip = $trip_result->fetch_assoc();
    $trip_stmt->close();

    if (!$trip) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Trip not found'
        ]);
        exit();
    }

    $detail_stmt = $conn->prepare("
        SELECT 
            td.day_number,
            td.schedule_time,
            a.attraction_id,
            a.attraction_name,
            a.attraction_category,
            a.attraction_image
        FROM trip_details td
        INNER JOIN attraction a 
            ON td.attraction_id = a.attraction_id
        WHERE td.trip_id = ?
        ORDER BY 
            td.day_number ASC,
            td.schedule_time ASC
    ");

    $detail_stmt->bind_param("i", $trip_id);
    $detail_stmt->execute();
    $detail_result = $detail_stmt->get_result();

    $attractions = [];

    while ($row = $detail_result->fetch_assoc()) {
        $attractions[] = $row;
    }

    $detail_stmt->close();

    echo json_encode([
        'status' => 'success',
        'trip' => $trip,
        'attractions' => $attractions
    ]);

    exit();
}

// ===============================
// UPDATE PROFILE
// ===============================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update_profile') {

    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($username === '' || $email === '') {
        echo json_encode([
            'status' => 'error',
            'message' => 'Username and email are required'
        ]);
        exit();
    }

    if ($password !== '') {
        $stmt = $conn->prepare("
            UPDATE users
            SET username = ?, user_email = ?, user_password = ?
            WHERE user_id = ?
        ");

        $stmt->bind_param("sssi", $username, $email, $password, $user_id);
    } else {
        $stmt = $conn->prepare("
            UPDATE users
            SET username = ?, user_email = ?
            WHERE user_id = ?
        ");

        $stmt->bind_param("ssi", $username, $email, $user_id);
    }

    if ($stmt->execute()) {
        $_SESSION['username'] = $username;

        echo json_encode([
            'status' => 'success',
            'message' => 'Profile updated successfully'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to update profile'
        ]);
    }

    $stmt->close();
    exit();
}

// ===============================
// UPLOAD PROFILE PHOTO
// ===============================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'upload_photo') {

    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'No photo uploaded'
        ]);
        exit();
    }

    $allowed_ext = ['jpg', 'jpeg', 'png', 'webp'];
    $file_ext = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));

    if (!in_array($file_ext, $allowed_ext)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Only JPG, JPEG, PNG and WEBP files are allowed'
        ]);
        exit();
    }

    $file_name = 'profile_' . $user_id . '_' . time() . '.' . $file_ext;
    $upload_path = '../../../assets/images/profile/' . $file_name;

    if (move_uploaded_file($_FILES['photo']['tmp_name'], $upload_path)) {

        $stmt = $conn->prepare("
            UPDATE users
            SET user_profile = ?
            WHERE user_id = ?
        ");

        $stmt->bind_param("si", $file_name, $user_id);
        $stmt->execute();
        $stmt->close();

        echo json_encode([
            'status' => 'success',
            'photo' => $file_name
        ]);

    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to upload photo'
        ]);
    }

    exit();
}

echo json_encode([
    'status' => 'error',
    'message' => 'Invalid request'
]);

?>