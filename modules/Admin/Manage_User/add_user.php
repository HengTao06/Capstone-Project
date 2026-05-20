<?php

require_once "../../../shared/php/db.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"]);
$email = trim($data["email"]);
$password = trim($data["password"]);
$role = trim($data["role"]);

if(
    empty($username) ||
    empty($email) ||
    empty($password) ||
    empty($role)
) {

    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);

    exit;
}

// CHECK EMAIL EXISTS
$checkSql =
"SELECT * FROM users WHERE user_email = ?";

$stmt = mysqli_prepare($conn, $checkSql);

mysqli_stmt_bind_param($stmt, "s", $email);

mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

if(mysqli_num_rows($result) > 0) {

    echo json_encode([
        "success" => false,
        "message" => "Email already exists"
    ]);

    exit;
}

// INSERT USER
$sql = "
INSERT INTO users
(username, user_email, user_password, user_role)
VALUES (?, ?, ?, ?)
";

$stmt = mysqli_prepare($conn, $sql);

mysqli_stmt_bind_param(
    $stmt,
    "ssss",
    $username,
    $email,
    $password,
    $role
);

if(mysqli_stmt_execute($stmt)) {

    echo json_encode([
        "success" => true
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to add user"
    ]);

}
?>