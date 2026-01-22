// Distinct experiments for M (Metallic focus)
const experimentsM = [
    { id: 1, name: "Hammer Test", text: "The sample flattened into a thin, shiny sheet." },
    { id: 2, name: "HCl Reactivity", text: "Vigorous bubbling (H2 gas); the solid slowly dissolved into a clear solution." },
    { id: 3, name: "Conductivity", text: "High conductivity detected. The multimeter maxed out immediately." },
    { id: 4, name: "Activity Series", text: "M successfully replaced Copper in a CuSO4 solution." },
    { id: 5, name: "Bunsen Burner", text: "After sanding, the surface shows a brilliant silver-white luster." },
    { id: 6, name: "Water Test", text: "High density (8.9 g/cm³). The sample sank rapidly in the graduated cylinder." }
];

// Distinct experiments for X (Non-metal focus)
const experimentsX = [
    { id: 1, name: "Bunsen Burner", text: "The sample sublimated into a thick, toxic purple gas. The room had to be evacuated." },
    { id: 2, name: "Solubility in Water", text: "The water turned a dark yellow-brown color after 24 hours." },
    { id: 3, name: "Brittleness Test", text: "Under the hammer, the sample shattered into a fine, dark purple powder." },
    { id: 4, name: "Hexane Test", text: "X dissolved completely in the organic solvent, creating a violet solution." },
    { id: 5, name: "Starch Indicator", text: "The solution turned a deep blue-black color, indicating a specific halogen." },
    { id: 6, name: "Thermal Conductivity", text: "Low conductivity. The material acted as an insulator." }
];

let selectedM = [];
let selectedX = [];

window.onload = () => {
    const student = JSON.parse(sessionStorage.getItem('activeStudent'));
    if(!student) window.location.href = 'index.html';
    
    openModal('mx-modal');

    const mList = document.getElementById('m-list');
    const xList = document.getElementById('x-list');

    // Render M experiments
    experimentsM.forEach(exp => {
        mList.innerHTML += `<div class="experiment-card" onclick="toggleSelection(${exp.id}, 'm', this)">${exp.name}</div>`;
    });

    // Render X experiments
    experimentsX.forEach(exp => {
        xList.innerHTML += `<div class="experiment-card" onclick="toggleSelection(${exp.id}, 'x', this)">${exp.name}</div>`;
    });
};

function toggleSelection(id, type, el) {
    let list = (type === 'm') ? selectedM : selectedX;
    const idx = list.indexOf(id);

    if (idx > -1) {
        list.splice(idx, 1);
        el.classList.remove(`selected-${type}`);
    } else if (list.length < 3) {
        list.push(id);
        el.classList.add(`selected-${type}`);
    }

    // Check if both sides have 3
    const btn = document.getElementById('run-btn');
    if(selectedM.length === 3 && selectedX.length === 3) {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.classList.add('bg-blue-600', 'cursor-pointer');
        btn.classList.remove('bg-gray-600', 'opacity-50');
    } else {
        btn.disabled = true;
        btn.classList.add('bg-gray-600', 'opacity-50');
        btn.classList.remove('bg-blue-600', 'cursor-pointer');
    }
}

function runLab() {
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    const output = document.getElementById('data-output');
    
    // Generate M Results
    let mHtml = "<div><h4 class='text-blue-400 font-bold mb-2 border-b border-blue-900'>Results for Element M</h4>";
    selectedM.forEach(id => {
        const item = experimentsM.find(e => e.id === id);
        mHtml += `<div class='bg-gray-800 p-3 rounded mb-2 text-sm'><span class='text-blue-300 font-bold'>${item.name}:</span> ${item.text}</div>`;
    });
    mHtml += "</div>";

    // Generate X Results
    let xHtml = "<div><h4 class='text-emerald-400 font-bold mb-2 border-b border-emerald-900'>Results for Element X</h4>";
    selectedX.forEach(id => {
        const item = experimentsX.find(e => e.id === id);
        xHtml += `<div class='bg-gray-800 p-3 rounded mb-2 text-sm'><span class='text-emerald-300 font-bold'>${item.name}:</span> ${item.text}</div>`;
    });
    xHtml += "</div>";

    output.innerHTML = mHtml + xHtml;
}

async function finalizeLab() {
    const student = JSON.parse(sessionStorage.getItem('activeStudent'));
    const assumptionText = document.getElementById('assumption').value;
    
    if(!assumptionText) return alert("Please enter your assumptions.");

    const entry = {
        fName: student.fName,
        lName: student.lName,
        period: student.period,
        mExps: selectedM.map(id => experimentsM.find(e => e.id === id).name),
        xExps: selectedX.map(id => experimentsX.find(e => e.id === id).name),
        assumption: assumptionText
    };

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx_WtPK1rEj8sx5_rKVnAaVVSJ_FIGRFEa_l3CQmeetVWB-CYzGcOajrGQo9h-1s6PjAA/exec'; // <--- UPDATE THIS AGAIN IF YOU RE-DEPLOYED

    try {
        const btn = document.querySelector('button[onclick="finalizeLab()"]');
        btn.innerText = "Submitting...";
        btn.disabled = true;

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });

        alert("Lab Submitted Successfully! Redirecting to entry page...");
        window.location.href = 'index.html';
    } catch (error) {
        alert("Submission failed. Check your connection.");
        btn.innerText = "Submit to Backend";
        btn.disabled = false;
    }
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function checkTeacher() {
    if(prompt("Access Code:") === "MXLabResults") {
        console.table(JSON.parse(localStorage.getItem('mx_results') || '[]'));
        alert("Teacher data check enabled. View Console (F12).");
    }
}
