<?php
ob_start();

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once "../../shared/php/db.php";
require_once "../../shared/php/session.php";

ob_clean(); // ← clears anything db.php/session.php printed

header('Content-Type: application/json');

$response = [
    "status" => "error",
    "message" => ""
];

// Check request
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    $response["message"] = "Invalid request";
    echo json_encode($response);
    exit();
}

// Get data safely
$username = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$username || !$email || !$password) {
    $response["message"] = "Missing fields";
    echo json_encode($response);
    exit();
}

// Test if $conn exists and works
if (!isset($conn) || $conn->connect_error) {
    $response["message"] = "DB connection failed: " . ($conn->connect_error ?? 'conn not set');
    echo json_encode($response);
    exit();
}

// Check duplicate email
$check = "SELECT user_id FROM users WHERE user_email = ?";
$stmt = $conn->prepare($check);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $response["message"] = "Email already exists";
    echo json_encode($response);
    exit();
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert user (role = user)
$sql = "INSERT INTO users (username, user_email, user_password, user_role, user_profile) 
        VALUES (?, ?, ?, 'user', NULL)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    $response["message"] = "Insert prepare failed: " . $conn->error;
    echo json_encode($response);
    exit();
}

$stmt->bind_param("sss", $username, $email, $hashedPassword);

if ($stmt->execute()) {
    $response["status"] = "success";
    $response["message"] = "Registration successful";
} else {
    $response["message"] = "Database error";
}

echo json_encode($response);
$conn->close();
?>