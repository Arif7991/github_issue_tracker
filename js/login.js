document.getElementById("loginForm").addEventListener("submit",(e)=>{

e.preventDefault()

const user=document.getElementById("username").value
const pass=document.getElementById("password").value

if(user==="admin" && pass==="admin123"){

localStorage.setItem("auth","true")
window.location="index.html"

}
else{
alert("Invalid credentials")
}

})