function login(showhide){
if(showhide == "show"){
    document.getElementById('popupbox').style.visibility="visible";
}

else if(showhide == "submit") {
	var username = document.getElementsByName('username');
	var password = document.getElementsByName('password');
	if(username == "user" && password == "tc362") {
		document.getElementById('popupbox').style.background="#00FF00";
	}
}
else{
    document.getElementById('popupbox').style.visibility="hidden";
}
}