<?php 

include('dataController.php');

if($_SERVER['REQUEST_METHOD'] == "POST")
{
	@$category_id = $_POST['category_id'];
	@$sub_cate_name = $_POST['sub_cate_name'];
	
	if(!empty($category_id) && !empty($sub_cate_name))
	{
		$result = $data_obj->get_sub_cate_by_id_name($category_id,$sub_cate_name);
		$count = mysqli_num_rows($result);
		
		if($count == 0)
		{	
			$sub_cate_image = comman_class::single_image_upload($upload_subcategory_path);
			$sub_cate_tray_image = comman_class::tray_image_upload($upload_subcategory_tray_path);
			
			$result1 = $data_obj->add_sub_cate($category_id,$sub_cate_name,$sub_cate_image,$sub_cate_tray_image,$created_date);
			if($result1 == true)
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
	echo '4';
}
?>