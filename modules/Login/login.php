<?php 
if (isset($_SESSION['redirect_after_login'])) {
    header("Location: " . $_SESSION['redirect_after_login']);
    unset($_SESSION['redirect_after_login']);
} else {
    header("Location: ../home/home.html");
}
exit();
?>