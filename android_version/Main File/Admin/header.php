<?php
	
	//inculde dataController file content
	require_once('controller/dataController.php');

?>

<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<link rel="icon" type="image/png" href="assets/img/favicon.ico">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />

	<title>WA Sticker</title>

	<meta content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' name='viewport' />
    <meta name="viewport" content="width=device-width" />
	
    <!--  Fonts and icons -->
    <link rel="stylesheet" href="assets/css/font-awesome.min.css" >
    <link rel="stylesheet" type="text/css" href='assets/css/google-font.css'>
	
    <!-- Bootstrap core CSS -->
    <link rel="stylesheet" href="assets/css/bootstrap.min.css" />

    <!--  Bootstrap Table core CSS -->
    <link rel="stylesheet" href="assets/css/bootstrap-dashboard.css" />

    <!--  Animation library for notifications -->
    <link rel="stylesheet" href="assets/css/animate.min.css" />
   
    <!--  CSS for addional effect -->
	<link rel="stylesheet" href="assets/css/style.css" />

</head>
<body>

<div class="wrapper">
    <div class="sidebar" data-color="purple" data-image="assets/img/sidebar-5.jpg">

    <!--

        Tip 1: you can change the color of the sidebar using: data-color="blue | azure | green | orange | red | purple"
        Tip 2: you can also add an image using data-image tag

    -->

    	<div class="sidebar-wrapper">
            <div class="logo">
                <a href="http://www.loopinfosol.com" class="simple-text">
                    WA Sticker
                </a>
            </div>

            <ul class="nav">
                <li class="active">
                    <a href="dashboard.php">
                        <i class="fa fa-tachometer"></i>
                        <p>Dashboard</p>
                    </a>
                </li>
				<hr>
                <li>
                    <a href="addSlider.php">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                        <p>Add Slider</p>
                    </a>
                </li>
                <li>
                    <a href="listSlider.php">
                        <i class="fa fa-list-ul" aria-hidden="true"></i>
                        <p>List Slider</p>
                    </a>
                </li>
				<hr>
                <li>
                    <a href="addCategory.php">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                        <p>Add Category</p>
                    </a>
                </li>
                <li>
                    <a href="listCategory.php">
                        <i class="fa fa-list-ul" aria-hidden="true"></i>
                        <p>List Category</p>
                    </a>
                </li>
				<hr>
                <li>
                    <a href="addSubCategory.php">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                        <p>Add SubCategory</p>
                    </a>
                </li>
				<li>
                    <a href="listSubCategory.php">
                        <i class="fa fa-list-ul" aria-hidden="true"></i>
                        <p>List SubCategory</p>
                    </a>
                </li>
				<hr>
				<li>
                    <a href="addPngSticker.php">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                        <p>Add PNG Sticker</p>
                    </a>
                </li>
				<li>
                    <a href="listPngSticker.php">
                        <i class="fa fa-list-ul" aria-hidden="true"></i>
                        <p>List PNG Sticker</p>
                    </a>
                </li>
				<hr>
				<li>
                    <a href="addWebpSticker.php">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                        <p>Add Webp Sticker</p>
                    </a>
                </li>
				<li>
                    <a href="listWebpSticker.php">
                        <i class="fa fa-list-ul" aria-hidden="true"></i>
                        <p>List Webp Sticker</p>
                    </a>
                </li>
            </ul>
    	</div>
	</div>

    <div class="main-panel">
        <nav class="navbar navbar-default navbar-fixed">
            <div class="container-fluid">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navigation-example-2">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
					
					<!-- Here is the URL Link for Dashboard page redirect -->
                    <a class="navbar-brand" href="dashboard.php">Dashboard</a>
                </div>
                <div class="collapse navbar-collapse">
                   
                    <ul class="nav navbar-nav navbar-right">
                        <li class="dropdown">
                              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                                    <p>
										Account
										<b class="caret"></b>
									</p>

                              </a>
                              <ul class="dropdown-menu">
                                <li><a href="changePassword.php">Change Password</a></li>
                              </ul>
                        </li>
                        <li>
                            <a href="logout.php" class="logout-btn">
                                <p>Log out</p>
                            </a>
                        </li>
						<li class="separator hidden-lg"></li>
                    </ul>
                </div>
            </div>
        </nav>

