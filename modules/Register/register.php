<?php
require_once "../../shared/php/db.php";
require_once "../../shared/php/session.php";

header('Content-Type: application/json');

// Get data
$username = $_POST['username'];
$email = $_POST['email'];
$password = $_POST['password'];

// Check if email exists
$check = "SELECT * FROM users WHERE user_email = ?";
$stmt = $conn->prepare($check);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo "Email already exists!";
    exit();
}

// Hash password (IMPORTANT)
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert into DB
$sql = "INSERT INTO users (username, user_email, user_password, user_role) 
        VALUES (?, ?, ?, 'user')";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $username, $email, $hashedPassword);

if ($stmt->execute()) {
    echo "Registration Success!";
} else {
    echo "Error occurred!";
}

$conn->close();
?>