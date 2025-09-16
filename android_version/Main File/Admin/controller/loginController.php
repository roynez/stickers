<?php 

include('dataController.php');

if($_SERVER['REQUEST_METHOD'] == "POST")
{
	@$admin_email = $_POST['admin_email'];
	@$admin_password = $_POST['admin_password'];

	if(!empty($admin_email) && !empty($admin_password))
	{		
		$result = $data_obj->adminLogin($admin_email,$admin_password);
		$count = mysqli_num_rows($result);		
		if($count > 0)
		{
			$row = mysqli_fetch_assoc($result);
			
			$_SESSION['admin_id'] =  $row['id'];
			$_SESSION['admin_name'] =  $row['admin_name'];
			$_SESSION['admin_email'] =  $row['admin_email'];
			
			echo '1';	
		}
		else
		{
			echo '0';
		}		
	}
	else
	{
		echo '10';
	}
} 

?>