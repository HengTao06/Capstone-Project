<?php
require_once '../../../shared/php/session.php';
require_once '../../../shared/php/db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: ../Login/login.html");
    exit();
}

$user_id = $_SESSION['user_id'];
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user data
    $stmt = $conn->prepare("SELECT username, user_email, user_profile FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    // Get completed trips
    $trips_stmt = $conn->prepare("
        SELECT t.trip_id, t.trip_name, t.start_date, t.end_date,
               c.city_name, co.country_name,
               a.attraction_name, a.attraction_image
        FROM trip t
        JOIN city c ON t.city_id = c.city_id
        JOIN country co ON c.country_id = co.country_id
        LEFT JOIN attraction a ON a.city_id = c.city_id
        WHERE t.user_id = ? AND t.trip_status = 'Completed'
        GROUP BY t.trip_id
    ");
    $trips_stmt->bind_param("i", $user_id);
    $trips_stmt->execute();
    $trips_result = $trips_stmt->get_result();
    $trips = [];
    while ($row = $trips_result->fetch_assoc()) {
        $trips[] = $row;
    }
    $trips_stmt->close();

    echo json_encode([
        'status' => 'success',
        'username' => $user['username'],
        'email' => $user['user_email'],
        'profile_photo' => $user['user_profile'],
        'trips' => $trips
    ]);
    exit();
}

// ===========================
// POST - Update profile
// ===========================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // UPDATE USERNAME AND EMAIL
    if ($action === 'update_profile') {
        $username = trim($_POST['username']);
        $email = trim($_POST['email']);
        $password = trim($_POST['password']);

        if (empty($username) || empty($email)) {
            echo json_encode(['status' => 'error', 'message' => 'Username and email are required']);
            exit();
        }

        if (!empty($password)) {
            $stmt = $conn->prepare("UPDATE users SET username=?, user_email=?, user_password=? WHERE user_id=?");
            $stmt->bind_param("sssi", $username, $email, $password, $user_id);
        } else {
            $stmt = $conn->prepare("UPDATE users SET username=?, user_email=? WHERE user_id=?");
            $stmt->bind_param("ssi", $username, $email, $user_id);
        }

        $stmt->execute();
        $stmt->close();

        $_SESSION['username'] = $username;

        echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully!']);
        exit();
    }

    // UPLOAD PROFILE PHOTO
    if ($action === 'upload_photo') {
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === 0) {
            $upload_dir = '../../../assets/images/';
            $file_ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
            $file_name = 'profile_' . $user_id . '_' . time() . '.' . $file_ext;
            $upload_path = $upload_dir . $file_name;

            if (move_uploaded_file($_FILES['photo']['tmp_name'], $upload_path)) {
                $stmt = $conn->prepare("UPDATE users SET user_profile=? WHERE user_id=?");
                $stmt->bind_param("si", $file_name, $user_id);
                $stmt->execute();
                $stmt->close();

                echo json_encode(['status' => 'success', 'photo' => $file_name]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to upload photo']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No photo uploaded']);
        }
        exit();
    }
    
}
?>


