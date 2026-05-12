<?php

require_once "../../../shared/php/db.php";
require_once "../../../shared/php/session.php";

header('Content-Type: application/json');

$sql = "SELECT * FROM users";
$result = mysqli_query($conn, $sql);

$users = [];

while($row = mysqli_fetch_assoc($result)) {
    $users[] = $row;
}

echo json_encode($users);

?>