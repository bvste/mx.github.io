// Database of possible identities
const metalIdentities = [
    { name: "Zinc", hammer: "Sample flattens, bends slightly", activity: "Activity Series", melting: "Sample melts in 30 seconds", flame: "Pale green/ bluish green flame" },
    { name: "Nickel", hammer: "Sample flattens, bends slightly", activity: "Activity Series", melting: "Sample melts in 5 minutes", flame: "Pale green/ bluish green flame" },
    { name: "Copper", hammer: "Sample flattens, bends slightly", activity: "Activity Series", melting: "Sample melts in 5 minutes", flame: "Bluish green flame" },
    { name: "Silver", hammer: "Sample flattens, bends slightly", activity: "Activity Series", melting: "Sample melts in 5 minutes", flame: "No Data" },
    { name: "Aluminum", hammer: "Sample flattens, bends slightly", activity: "Activity Series", melting: "Sample melts in 5 minutes", flame: "White/silvery white flame" },
    { name: "Iron", hammer: "Sample flattens, bends slightly", activity: "Activity Series", melting: "Sample melts in 5 minutes", flame: "Red flame" },
    { name: "Magnesium", hammer: "Sample flattens, bends slightly", activity: "Activity Series", melting: "Sample melts in 5 minutes", flame: "Very blinding white light, white powder formed after" }
];

const nonMetalIdentities = [
    { name: "Iodine", heat: "Sublimates into thick purple vapor.", water: "Turns water dark yellow/brown.", solvent: "Dissolves into a violet solution." },
    { name: "Chlorine", heat: "Expands as a pale green gas.", water: "Creates a pale, acidic bleach-like solution.", solvent: "Dissolves into a light yellow liquid." },
    { name: "Bromine", heat: "Deep red-orange vapors fill the tube.", water: "Heavy orange-red liquid at the bottom.", solvent: "Orange-brown solution forms." },
    { name: "Phosphorus", heat: "Ignites into a bright white light/smoke.", water: "Does not dissolve; stays as a waxy solid.", solvent: "Partially dissolves in organic liquids." }
];

// Logic to pick the "Hidden Identity" for this session
let activeM = metalIdentities[Math.floor(Math.random() * metalIdentities.length)];
let activeX = nonMetalIdentities[Math.floor(Math.random() * nonMetalIdentities.length)];

// List of available experiment types
const experimentsM = [
    { id: 'hammer', name: "Hammer Test" },
    { id: 'activity', name: "Activity Testing" },
    { id: 'melting', name: "Crucible + Matches" },
    { id: 'conduct', name: "Conductivity Test", static: "Red and Green lights shine brightly" },
    { id: 'water', name: "Water Submerging", static: "Sample sinks in water and does not react." },
    { id: 'flame', name: "Flame Test"}
];

const experimentsX = [
    { id: 'heat', name: "Bunsen Burner" },
    { id: 'water', name: "Water Solubility" },
    { id: 'solvent', name: "Organic Solvent" },
    { id: 'brittle', name: "Brittleness", static: "Sample shatters into a fine powder." },
    { id: 'starch', name: "Starch Indicator", static: "No reaction (Starch stays white)." },
    { id: 'conductX', name: "Thermal Probe", static: "Material acts as a thermal insulator." }
];

let selectedM = [];
let selectedX = [];

window.onload = () => {
    if(!sessionStorage.getItem('activeStudent')) window.location.href = 'index.html';
    openModal('mx-modal');

    const mList = document.getElementById('m-list');
    const xList = document.getElementById('x-list');

    experimentsM.forEach(exp => {
        mList.innerHTML += `<div class="experiment-card" onclick="toggleSelection('${exp.id}', 'm', this)">${exp.name}</div>`;
    });
    experimentsX.forEach(exp => {
        xList.innerHTML += `<div class="experiment-card" onclick="toggleSelection('${exp.id}', 'x', this)">${exp.name}</div>`;
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

    const btn = document.getElementById('run-btn');
    btn.disabled = !(selectedM.length === 3 && selectedX.length === 3);
    btn.style.opacity = btn.disabled ? "0.5" : "1";
}

function runLab() {
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    const output = document.getElementById('data-output');
    
    let mHtml = "<div><h4 class='text-blue-400 font-bold mb-2'>Results for M</h4>";
    selectedM.forEach(id => {
        const exp = experimentsM.find(e => e.id === id);
        const resultText = exp.static || activeM[id];
        mHtml += `<div class='bg-gray-800 p-3 rounded mb-2 text-sm'><b>${exp.name}:</b> ${resultText}</div>`;
    });
    
    let xHtml = "<div><h4 class='text-emerald-400 font-bold mb-2'>Results for X</h4>";
    selectedX.forEach(id => {
        const exp = experimentsX.find(e => e.id === id);
        const resultText = exp.static || activeX[id];
        xHtml += `<div class='bg-gray-800 p-3 rounded mb-2 text-sm'><b>${exp.name}:</b> ${resultText}</div>`;
    });

    output.innerHTML = mHtml + "</div>" + xHtml + "</div>";
}

async function finalizeLab() {
    const student = JSON.parse(sessionStorage.getItem('activeStudent'));
    const assumptionText = document.getElementById('assumption').value;
    
    if(!assumptionText) return alert("Please enter your assumptions.");

    const entry = {
    fName: student.fName,
    lName: student.lName,
    period: student.period,
    actualIdentityM: activeM.name, 
    actualIdentityX: activeX.name, 
    mExps: selectedM,
    xExps: selectedX,
    assumption: document.getElementById('assumption').value
    };

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwsKhE4KFf_c7Ra6i3IAXRJ1Rt-rBGYSgeOdRpy1hKKaf28A2AWZW5odUdS2xTpHeKr2A/exec'; // <--- UPDATE THIS AGAIN IF YOU RE-DEPLOYED

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

function resetSelections() {
    selectedM = [];
    selectedX = [];
    
    // This finds all cards and "turns off" their blue/green borders
    document.querySelectorAll('.experiment-card').forEach(card => {
        card.classList.remove('selected-m', 'selected-x');
    });
    
    // Disable the run button again
    const btn = document.getElementById('run-btn');
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.classList.remove('bg-blue-600');
    btn.classList.add('bg-gray-600');
}
