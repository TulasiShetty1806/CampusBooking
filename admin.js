const tokenA = localStorage.getItem('token'); // JWT token
let mostBookedChartInstance = null;
let peakHoursChartInstance = null;

// ----------------------------
// Load Admin Info
// ----------------------------
async function loadAdminInfo() {
    try {
        const res = await axios.get('http://localhost:3000/api/auth/me', {
            headers: { Authorization: `Bearer ${tokenA}` }
        });

        if (res.data.role !== 'admin') {
            alert("You are not an admin!");
            window.location.href = 'dashboard.html';
            return;
        }
        document.getElementById('adminName').innerText = res.data.name;
    } catch (err) {
        console.error('Error fetching admin info', err);
        document.getElementById('adminName').innerText = 'Admin';
    }
}

// ----------------------------
// Add Resource
// ----------------------------
async function addResource() {
    const name = document.getElementById('resourceName').value;
    const type = document.getElementById('resourceType').value;
    const desc = document.getElementById('resourceDesc').value;

    if (!name || !type || !desc) {
        alert("Please fill all fields");
        return;
    }

    try {
        const res = await axios.post(
            'http://localhost:3000/api/resources',
            { name, type, description: desc },
            { headers: { Authorization: `Bearer ${tokenA}` } }
        );
        alert(res.data.message);
        document.getElementById('resourceName').value = '';
        document.getElementById('resourceType').value = '';
        document.getElementById('resourceDesc').value = '';
        loadPending();
        loadAnalytics();
    } catch (err) {
        console.error(err.response ? err.response.data : err);
        alert(err.response?.data?.message || "Error adding resource");
    }
}

// ----------------------------
// Load Pending Bookings
// ----------------------------
async function loadPending() {
    try {
        const res = await axios.get('http://localhost:3000/api/bookings/my', {
            headers: { Authorization: `Bearer ${tokenA}` }
        });

        const tbody = document.querySelector('#pendingTable tbody');
        tbody.innerHTML = '';

        res.data.forEach(b => {
            if (b.status === 'pending') {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${b.user_name}</td>
                    <td>${b.resource_name}</td>
                    <td>${new Date(b.start_time).toLocaleString()}</td>
                    <td>${new Date(b.end_time).toLocaleString()}</td>
                `;

                const actionTd = document.createElement('td');

               const approveBtn = document.createElement('button');
approveBtn.innerText = 'Approve';
approveBtn.style.marginRight = '5px';
approveBtn.onclick = async () => {
    try {
        await axios.post(
            'http://localhost:3000/api/bookings/action',
            { booking_id: b.id, action: 'approved' },
            { headers: { Authorization: `Bearer ${tokenA}` } }
        );
        loadPending();
        loadAnalytics();
    } catch (err) {
        console.error(err);
    }
};

const rejectBtn = document.createElement('button');
rejectBtn.innerText = 'Reject';
rejectBtn.onclick = async () => {
    try {
        await axios.post(
            'http://localhost:3000/api/bookings/action',
            { booking_id: b.id, action: 'rejected' },
            { headers: { Authorization: `Bearer ${tokenA}` } }
        );
        loadPending();
        loadAnalytics();
    } catch (err) {
        console.error(err);
    }
};


                actionTd.appendChild(approveBtn);
                actionTd.appendChild(rejectBtn);
                tr.appendChild(actionTd);

                tbody.appendChild(tr);
            }
        });
    } catch (error) {
        console.error('Error loading pending bookings:', error);
    }
}

// ----------------------------
// Analytics
// ----------------------------
async function loadAnalytics() {
    try {
        const res = await axios.get('http://localhost:3000/api/bookings/all', {
            headers: { Authorization: `Bearer ${tokenA}` }
        });

        // Destroy old charts if exist
        if (mostBookedChartInstance) mostBookedChartInstance.destroy();
        if (peakHoursChartInstance) peakHoursChartInstance.destroy();

        // Most Booked
        const counts = {};
        res.data.forEach(b => {
            if (b.status === 'approved') counts[b.resource_name] = (counts[b.resource_name] || 0) + 1;
        });

        const ctx = document.getElementById('mostBookedChart').getContext('2d');
        mostBookedChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    data: Object.values(counts),
                    backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40']
                }]
            },
            options: { responsive: true }
        });

        // Peak Hours
        const hours = {};
        res.data.forEach(b => {
            if (b.status === 'approved') {
                const h = new Date(b.start_time).getHours();
                hours[h] = (hours[h] || 0) + 1;
            }
        });

        const ctx2 = document.getElementById('peakHoursChart').getContext('2d');
        peakHoursChartInstance = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: Object.keys(hours),
                datasets: [{
                    label: 'Bookings per hour',
                    data: Object.values(hours),
                    backgroundColor: '#ff9800'
                }]
            },
            options: { responsive: true }
        });

    } catch (err) {
        console.error('Error loading analytics:', err.response ? err.response.data : err);
    }
}

// ----------------------------
// Initialize
// ----------------------------
loadAdminInfo();
loadPending();
loadAnalytics();