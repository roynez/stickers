<?php 

include('dataController.php');

if($_SERVER['REQUEST_METHOD'] == "POST")
{
	@$old_password = $_POST['old_password'];
	@$new_password = $_POST['new_password'];
	
	@$admin_id = $_SESSION['admin_id'];
	
	if(!empty($admin_id) && !empty($old_password) && !empty($new_password))
	{
		$get_result = $data_obj->get_admin_by_id_password($admin_id,$old_password);
		$count = mysqli_num_rows($get_result);

		if($count > 0)
		{			
			$update_result = $data_obj->update_admin_password($admin_id,$new_password);
			if($update_result == true)
			{
				echo '0';
			}	
			else
			{
				echo '1';
			}							
		}
		else
		{
			echo '2';
		}
	}
	else
	{
		echo '3';
	}	
} 
else
{
	echo '1';
}
?>