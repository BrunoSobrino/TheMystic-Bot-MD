<?php
$short_options = "p:";
$long_options = ["paste:"];
$options = getopt($short_options, $long_options);
$paste = isset($options["p"]) ? $options["p"] : $options["paste"];
$isi = base64_decode($paste);
$random = rand(1, 99999999);
$api_dev_key            = '2j-PvQpFmJS8OOJefnkaPHbyI3GL9UzE'; // your api_developer_key
$api_paste_code         = $isi; // tu texto pegado
$api_paste_private      = '0'; // 0=public 1=unlisted 2=private
$api_paste_name         = $random; // nombre o título de tu pasta
$api_paste_expire_date      = 'N';
$api_paste_format       = 'text';
$api_user_key           = ''; // si se utiliza una api_user_key no válida o caducada, se generará un error. Si no se usa api_user_key, se creará un pegado de invitado
$api_paste_name         = urlencode($api_paste_name);
$api_paste_code         = urlencode($api_paste_code);
 
$url                = 'https://pastebin.com/api/api_post.php';
$ch                 = curl_init($url);
 
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, 'api_option=paste&api_user_key='.$api_user_key.'&api_paste_private='.$api_paste_private.'&api_paste_name='.$api_paste_name.'&api_paste_expire_date='.$api_paste_expire_date.'&api_paste_format='.$api_paste_format.'&api_dev_key='.$api_dev_key.'&api_paste_code='.$api_paste_code.'');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_VERBOSE, 1);
curl_setopt($ch, CURLOPT_NOBODY, 0);
 
$response           = curl_exec($ch);
$resultados = str_replace('https://pastebin.com', 'https://pastebin.com/raw', $response);
echo "Paste :\n".$response."\nRaw :\n".$resultados;
?>