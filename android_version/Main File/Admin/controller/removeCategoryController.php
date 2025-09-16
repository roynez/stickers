<?php 
include('dataController.php');

if($_SERVER['REQUEST_METHOD'] == "POST")
{
	@$category_id = $_POST['category_id'];
	
	if(!empty($category_id))
	{		
		$result = $data_obj->remove_category_by_id($category_id);
		if($result == true)
		{
			echo "0";
		}
		else	
		{
			echo "1";
		}		
	}
	else
	{
		echo "1";
	}
} 
else
{
	echo "1";
}
?>