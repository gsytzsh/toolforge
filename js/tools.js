function base64Encode(){
let input=document.getElementById("input").value;
document.getElementById("output").value=btoa(input);
}

function base64Decode(){
let input=document.getElementById("input").value;
try{
document.getElementById("output").value=atob(input);
}catch(e){
document.getElementById("output").value="Invalid Base64";
}
}

function caseConvert(){
let input=document.getElementById("input").value;
document.getElementById("output").value=input.toUpperCase();
}

function jsonFormat(){
let input=document.getElementById("input").value;

try{
let obj=JSON.parse(input);
document.getElementById("output").value=
JSON.stringify(obj,null,2);
}catch(e){
document.getElementById("output").value="Invalid JSON";
}

}

function uuidGenerate(){
document.getElementById("output").value=crypto.randomUUID();
}

function wordCount(){
let input=document.getElementById("input").value;
let count=input.trim().split(/\s+/).length;
document.getElementById("output").value=count+" words";
}

function passwordGenerate(){

let chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

let pass="";

for(let i=0;i<16;i++){
pass+=chars[Math.floor(Math.random()*chars.length)];
}

document.getElementById("output").value=pass;

}

function urlToQR(){

let input=document.getElementById("input").value;

let url="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="+encodeURIComponent(input);

document.getElementById("output").value=url;

}
