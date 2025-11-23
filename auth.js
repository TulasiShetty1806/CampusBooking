async function login(){
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await axios.post('http://localhost:3000/api/auth/login',{email,password});
        console.log(res.data);

        if(res.data.token){
            localStorage.setItem('token',res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            if(res.data.user.role==='admin') window.location.href='admin.html';
            else window.location.href='dashboard.html';
        } 
        else { 
            alert(res.data.message); 
        }

    } catch(err){
        console.log(err.response.data); // 👈 SHOW ACTUAL ERROR
        alert(err.response.data.message || "Login failed");
    }
}


async function register(){
    const name=document.getElementById('name').value;
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    const role=document.getElementById('role').value;
    const res=await axios.post('http://localhost:3000/api/auth/register',{name,email,password,role});
    alert(res.data.message);
    if(res.data.message==='Registered Successfully') window.location.href='index.html';
}
