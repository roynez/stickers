<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//date_default_timezone_set('Asia/Kolkata');

include ('commonClass/responseClass.php');
include ('commonClass/commonVariable.php');


$data_obj = new Data();

class data  
{   
	var  $conn;
	
	//constructor to eastablishment connection with database
	public function connect_db()
	{   
   
		//host , User , Pass , DB Name
		$conn = new mysqli("localhost", "root", "", "wa_sticker");
		
		if (mysqli_connect_errno()) 
		{ 
			printf("Connect failed: %s\n", mysqli_connect_error());
			exit(); 
		} 
		
		$conn->set_charset("utf8mb4");
		
		return  $conn; 
	} 
	
	/*------------------------------------  tbl Slider  -----------------------------------*/	
	/*---------------------------------------------------------------------------------------*/ 
		
	public function get_active_slider()
	{
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_slider WHERE is_active = 'YES' ORDER BY updated_date DESC";
		$result = mysqli_query($conn,$sql);
		return $result;
	}	
	
	/*------------------------------------  tbl category  -----------------------------------*/	
	/*---------------------------------------------------------------------------------------*/ 
		
	public function get_active_category()
	{
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_category WHERE is_active = 'YES'";
		$result = mysqli_query($conn,$sql);
		return $result;
	}	
	
	public function get_category_by_id($category_id)
	{  			
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_category WHERE id = '$category_id'";
		$result = mysqli_query($conn,$sql);
		return $result;
	}	
	
	/*------------------------------------  tbl sub_cate  -----------------------------------*/	
	/*---------------------------------------------------------------------------------------*/ 
		
	public function get_active_sub_category()
	{  			
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sub_category WHERE is_active = 'YES' ORDER BY sub_cate_name ASC";
		$result = mysqli_query($conn,$sql);
		return $result;
	}	
	
	public function get_active_just_arrived_sub_category()
	{  			
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sub_category WHERE is_active = 'YES' ORDER BY created_date DESC LIMIT 5";
		$result = mysqli_query($conn,$sql);
		return $result;
	}	
	
	public function get_active_sub_category_by_id($category_id)
	{  			
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sub_category WHERE category_id = '$category_id' AND is_active = 'YES'";
		$result = mysqli_query($conn,$sql);
		return $result;
	}	
	
	public function get_active_sub_cate_by_id($category_id)
	{  			
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sub_category WHERE category_id = '$category_id' AND is_active = 'YES'";
		$result = mysqli_query($conn,$sql);
		return $result;
	}	
	
	public function get_sub_cate_by_id($sub_cate_id)
	{  			
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sub_category WHERE id = '$sub_cate_id'";
		$result = mysqli_query($conn,$sql);
		return $result;
	}	
	
	/*-----------------------------------  tbl Png sticker  ---------------------------------*/	
	/*---------------------------------------------------------------------------------------*/ 
		
	public function get_png_sticker()
	{
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sticker_png ORDER BY sticker_name ASC";
		$result = mysqli_query($conn,$sql);
		return $result;
	}	
	
	public function get_png_sticker_by_id($sticker_id)
	{  			
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sticker_png WHERE id = '$sticker_id'";
		$result = mysqli_query($conn,$sql);
		return $result;
	}		
		
	public function get_png_sticker_by_sub_cate_id($sub_cate_id)
	{  			
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sticker_png WHERE sub_cate_id = '$sub_cate_id' ORDER BY RAND() LIMIT 30";
		$result = mysqli_query($conn,$sql);
		return $result;
	}
	
	/*----------------------------------  tbl Webp sticker  ---------------------------------*/	
	/*---------------------------------------------------------------------------------------*/ 
		
	public function get_Webp_sticker()
	{
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sticker_webp ORDER BY sticker_name ASC";
		$result = mysqli_query($conn,$sql);
		return $result;
	}	
	
	public function get_Webp_sticker_by_id($sticker_id)
	{  			
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sticker_webp WHERE id = '$sticker_id'";
		$result = mysqli_query($conn,$sql);
		return $result;
	}		
		
	public function get_Webp_sticker_by_sub_cate_id($sub_cate_id)
	{  			
		$conn = $this->connect_db(); 		
		$sql = "SELECT * FROM tbl_sticker_webp WHERE sub_cate_id = '$sub_cate_id' ORDER BY RAND() LIMIT 30";
		$result = mysqli_query($conn,$sql);
		return $result;
	}		
}
?>
