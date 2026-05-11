<?php
require_once '../../../shared/php/session.php';
require_once '../../../shared/php/db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: ../Login/login.html");
    exit();
}

$user_id = $_SESSION['user_id'];

// Get user data from database
$stmt = $conn->prepare("SELECT username, user_email, user_profile FROM users WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

// Return user data as JSON
header('Content-Type: application/json');
echo json_encode([
    'username' => $user['username'],
    'email' => $user['user_email'],
    'profile_photo' => $user['user_profile']
]);
?>