<?php 
include('dataController.php');

if($_SERVER['REQUEST_METHOD'] == "POST")
{
	@$category_id = $_POST['category_id'];
	if(!empty($category_id))
	{
		$result = $data_obj->get_sub_cate_by_catid($category_id);
		$count = mysqli_num_rows($result);
		
		if($count > 0)
		{	
			while($row = mysqli_fetch_assoc($result))
			{
				$sub_cate_id = $row['id'];	
				$sub_cate_name = $row['sub_cate_name'];	

				echo'<option value="'.$sub_cate_id.'">'.$sub_cate_name.'</option>';
			}		
		}
		else
		{
			echo '<option value="">Not Found..</option>';
		}
	}
	else
	{
		echo '<option value="">Not Found..</option>';
	}	
} 
else
{
	echo '<option value="">Not Found..</option>';
}
?>