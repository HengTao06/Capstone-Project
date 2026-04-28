<?php
require_once "session.php";

if (!isset($_SESSION['user_id'])) {

    // Save current page
    $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];

    header("Location: ../../modules/User/Login/login.html");
    exit();
}
?>