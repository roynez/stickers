<?php

	/* Include Data Controller file content */
	require_once('controller/dataController.php');

?>

<!DOCTYPE html>
<html lang="en">
<head>
	<title>WA Sticker</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
<!--===============================================================================================-->	
	<link rel="icon" type="image/png" href="img/icons/favicon.ico"/>
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="assets/css/font-awesome.min.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="assets/css/login.css">
<!--===============================================================================================-->
	<link rel="stylesheet" type="text/css" href="assets/css/style.css">
<!--===============================================================================================-->

</head>
<body>
	
	<div class="limiter">
		<div class="container-login" style="background-image: url('assets/img/bg-01.jpg');">
			
			<div id="form-loader" class="loader-div">
				<img class="login-loader-image" src="assets/img/processing.gif">
			</div>		
			
			<div class="wrap-login">
			
				<div class="login-form validate-form">
					
					<!--============ Warning Alert Box ============-->
					<div class="alert alert-danger" id="faild" style='display:none;'>
						<span class="entypo-attention"></span>
						<strong>!</strong>&nbsp;&nbsp;Invalid Credential .
					</div>
					<div class="alert alert-danger" id="warning"  style='display:none;'>
						<span class="entypo-attention"></span>
						<strong>!</strong>&nbsp;&nbsp;Please fill all the field.
					</div>
					
					<span class="login-form-title p-b-34 p-t-27">
						Log in
					</span>
					</br>
					<div class="wrap-input validate-input" data-validate = "Enter email">
						<i class="fa fa-user" aria-hidden="true"></i>
						<input class="input" type="text" id="admin_email" name="admin_email" placeholder="Email">
					</div>

					<div class="wrap-input validate-input" data-validate="Enter password">
						<i class="fa fa-unlock-alt" aria-hidden="true"></i>
						<input class="input" type="password" id="admin_password" name="admin_password" placeholder="Password">
					</div>

					<div class="container-login-form-btn">
						<button class="login-form-btn" onClick="adminLogin();">
							Login
						</button>
					</div>
										
				</div>
			</div>
		</div>
	</div>
	
<!--===============================================================================================-->
	<script src="assets/js/jquery.min.js"></script>
<!--===============================================================================================-->
	<script src="assets/js/bootstrap.min.js"></script>
<!--===============================================================================================-->
	<script src="assets/js/custom.js"></script>

</body>
</html>