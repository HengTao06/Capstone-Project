<?php
require_once "../../../shared/php/db.php";
require_once "../../../shared/php/session.php";

header('Content-Type: application/json');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$email = $_POST['email'];
$password = $_POST['password'];

// Query user
$sql = "SELECT * FROM users WHERE user_email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    if ($password === $user['user_password']) {

        // Save session
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['user_role'];

        echo json_encode([
            "status" => "success",
            "role" => $user['user_role']
        ]);

    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Wrong password"
        ]);
    }

} else {
    echo json_encode([
        "status" => "error",
        "message" => "User not found"
    ]);
}

$conn->close();
?>

