const experiments = [
    { id: 1, name: "Density Test", text: "Material sinks in water; 8.9g/cm3." },
    { id: 2, name: "Acid Test", text: "Reacts slowly; releases H2 gas." },
    { id: 3, name: "Conductivity", text: "Strong conductor of electricity." },
    { id: 4, name: "Luster", text: "Highly reflective surface." },
    { id: 5, name: "Heat Test", text: "Melt point is high; X turns to gas." },
    { id: 6, name: "Magnetism", text: "Material shows no magnetic field." }
];

let selectedM = [];
let selectedX = [];

// Initialize cards
window.onload = () => {
    const student = JSON.parse(sessionStorage.getItem('activeStudent'));
    if(!student) window.location.href = 'index.html';
    
    // Auto-open MX props on start
    openModal('mx-modal');

    const mList = document.getElementById('m-list');
    const xList = document.getElementById('x-list');

    experiments.forEach(exp => {
        mList.innerHTML += `<div class="experiment-card" onclick="toggleSelection(${exp.id}, 'm', this)">${exp.name}</div>`;
        xList.innerHTML += `<div class="experiment-card" onclick="toggleSelection(${exp.id}, 'x', this)">${exp.name}</div>`;
    });
};

function toggleSelection(id, type, el) {
    let list = type === 'm' ? selectedM : selectedX;
    const idx = list.indexOf(id);

    if (idx > -1) {
        list.splice(idx, 1);
        el.classList.remove(`selected-${type}`);
    } else if (list.length < 3) {
        list.push(id);
        el.classList.add(`selected-${type}`);
    }

    const btn = document.getElementById('run-btn');
    if(selectedM.length === 3 && selectedX.length === 3) {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.classList.add('bg-blue-600');
    }
}

function runLab() {
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    const output = document.getElementById('data-output');
    output.innerHTML = "<div><h4 class='text-blue-400 font-bold'>M Results</h4>" + 
        selectedM.map(id => `<p class='text-sm mt-2'>• ${experiments.find(e => e.id===id).text}</p>`).join('') + "</div>";
    output.innerHTML += "<div><h4 class='text-emerald-400 font-bold'>X Results</h4>" + 
        selectedX.map(id => `<p class='text-sm mt-2'>• ${experiments.find(e => e.id===id).text}</p>`).join('') + "</div>";
}

async function finalizeLab() {
    const student = JSON.parse(sessionStorage.getItem('activeStudent'));
    const assumptionText = document.getElementById('assumption').value;
    
    if(!assumptionText) return alert("Write a CER below explaining your findings based on the data.");

    const entry = {
        fName: student.fName,
        lName: student.lName,
        period: student.period,
        mExps: selectedM.map(id => experiments.find(e => e.id === id).name),
        xExps: selectedX.map(id => experiments.find(e => e.id === id).name),
        assumption: assumptionText
    };

    // --- GOOGLE SHEETS INTEGRATION ---
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/u/5/home/projects/1iY52m1EHMcpUjp5Iu7SGJ8-TQblk7v4eYxg59gfvGrQBfwqCzNIYh1-h/edit'; // <--- GOOGLE SHEET WEB APP
    
    try {
        // Show loading state
        const btn = document.querySelector('button[onclick="finalizeLab()"]');
        btn.innerText = "Submitting...";
        btn.disabled = true;

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Script Web Apps
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });

        // Also save a local backup just in case
        let logs = JSON.parse(localStorage.getItem('mx_results') || '[]');
        logs.push(entry);
        localStorage.setItem('mx_results', JSON.stringify(logs));

        alert("Lab Submitted Successfully!");
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error!', error.message);
        alert("Submission failed. Please check your internet connection.");
        btn.innerText = "Submit to Backend";
        btn.disabled = false;
    }
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function checkTeacher() {
    if(prompt("Access Code:") === "MXLabResults") {
        console.table(JSON.parse(localStorage.getItem('mx_results') || '[]'));
        alert("Data printed to Console (F12)");
    }
}
