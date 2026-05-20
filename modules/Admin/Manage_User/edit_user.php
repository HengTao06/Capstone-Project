<?php

require_once "../../../shared/php/db.php";

header("Content-Type: application/json");

$data =
json_decode(file_get_contents("php://input"), true);

$user_id =
trim($data["user_id"]);

$username =
trim($data["username"]);

$email =
trim($data["email"]);

$role =
trim($data["role"]);


// VALIDATION
if(
    empty($user_id) ||
    empty($username) ||
    empty($email) ||
    empty($role)
) {

    echo json_encode([
        "success" => false,
        "message" => "All fields are required"
    ]);

    exit;
}


// CHECK EMAIL EXISTS FOR OTHER USERS
$checkSql = "
SELECT *
FROM users
WHERE user_email = ?
AND user_id != ?
";

$stmt =
mysqli_prepare($conn, $checkSql);

mysqli_stmt_bind_param(
    $stmt,
    "si",
    $email,
    $user_id
);

mysqli_stmt_execute($stmt);

$result =
mysqli_stmt_get_result($stmt);

if(mysqli_num_rows($result) > 0) {

    echo json_encode([
        "success" => false,
        "message" => "Email already exists"
    ]);

    exit;
}


// UPDATE USER
$sql = "
UPDATE users
SET
    username = ?,
    user_email = ?,
    user_role = ?
WHERE user_id = ?
";

$stmt =
mysqli_prepare($conn, $sql);

mysqli_stmt_bind_param(
    $stmt,
    "sssi",
    $username,
    $email,
    $role,
    $user_id
);

if(mysqli_stmt_execute($stmt)) {

    echo json_encode([
        "success" => true
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to update user"
    ]);

}

?>