const user = JSON.parse(localStorage.getItem('user'));
document.getElementById('userName').innerText = user.name;
const token = localStorage.getItem('token');

async function loadResources(){
    const res = await axios.get('http://localhost:3000/api/resources',{headers:{Authorization: token}});
    const select = document.getElementById('resourceSelect');
    res.data.forEach(r=>{ const opt=document.createElement('option'); opt.value=r.id; opt.innerText=r.name; select.appendChild(opt); });
}
loadResources();

async function bookResource(){
    const resource_id = document.getElementById('resourceSelect').value;
    const start_time = document.getElementById('startTime').value;
    const end_time = document.getElementById('endTime').value;
    const res = await axios.post('http://localhost:3000/api/bookings',{resource_id,start_time,end_time},{headers:{Authorization: token}});
    alert(res.data.message);
    loadBookings();
    loadCalendar();
}

async function loadBookings(){
    const res = await axios.get('http://localhost:3000/api/bookings/my',{headers:{Authorization: token}});
    const tbody = document.querySelector('#bookingTable tbody');
    tbody.innerHTML='';
    res.data.forEach(b=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${b.resource_name}</td>
                      <td>${b.start_time}</td>
                      <td>${b.end_time}</td>
                      <td>${b.status}</td>
                      <td>${b.status==='approved'?`<img src="https://api.qrserver.com/v1/create-qr-code/?data=Booking:${b.id}&size=50x50"/>`:''}</td>`;
        tbody.appendChild(tr);
    });
}
loadBookings();

// Calendar
async function loadCalendar(){
    const res = await axios.get('http://localhost:3000/api/bookings/my',{headers:{Authorization: token}});
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML='';
    const events = res.data.map(b=>({title:b.resource_name,start:b.start_time,end:b.end_time,color:b.status==='approved'?'green':'orange'}));
    const calendar = new FullCalendar.Calendar(calendarEl,{initialView:'dayGridMonth',events});
    calendar.render();
}
loadCalendar();
