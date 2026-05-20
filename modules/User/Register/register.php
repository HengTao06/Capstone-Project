<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once "../../../shared/php/db.php";
require_once "../../../shared/php/session.php";

ob_clean();
header('Content-Type: application/json');

$response = ["status" => "error", "message" => ""];

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    $response["message"] = "Invalid request";
    echo json_encode($response);
    exit();
}

$username = $_POST['username'] ?? '';
$email    = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (!$username || !$email || !$password) {
    $response["message"] = "Missing fields";
    echo json_encode($response);
    exit();
}

if (!isset($conn) || $conn->connect_error) {
    $response["message"] = "DB connection failed";
    echo json_encode($response);
    exit();
}

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

$userPassword = $password;

$sql = "INSERT INTO users (username, user_email, user_password, user_role, user_profile) 
        VALUES (?, ?, ?, 'user', '')";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $username, $email, $userPassword);

if ($stmt->execute()) {
    $response["status"] = "success";
    $response["message"] = "Registration successful";
} else {
    $response["message"] = "Execute failed: " . $stmt->error;
}

echo json_encode($response);
$conn->close();
?>