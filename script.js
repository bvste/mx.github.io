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

function finalizeLab() {
    const student = JSON.parse(sessionStorage.getItem('activeStudent'));
    const entry = {
        name: `${student.fName} ${student.lName}`,
        period: student.period,
        mExps: selectedM,
        xExps: selectedX,
        assumption: document.getElementById('assumption').value,
        date: new Date().toLocaleString()
    };

    let logs = JSON.parse(localStorage.getItem('mx_results') || '[]');
    logs.push(entry);
    localStorage.setItem('mx_results', JSON.stringify(logs));
    alert("Lab Submitted!");
    window.location.href = 'index.html';
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function checkTeacher() {
    if(prompt("Access Code:") === "MXLabResults") {
        console.table(JSON.parse(localStorage.getItem('mx_results') || '[]'));
        alert("Data printed to Console (F12)");
    }
}
