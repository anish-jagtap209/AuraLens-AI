const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const loadingEl = document.getElementById('loading');
const outputEl = document.getElementById('outputContainer');
const codeEl = document.getElementById('codeOutput');
const filePreviewContainer = document.getElementById('filePreviewContainer');
const filePreview = document.getElementById('filePreview');
const removeFileBtn = document.getElementById('removeFile');
const copyBtn = document.getElementById('copyBtn');
const frameworkSelect = document.getElementById('framework');
const outputBadge = document.getElementById('outputBadge');

// History UI Elements
const historyToggleBtn = document.getElementById('historyToggleBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const historySidebar = document.getElementById('historySidebar');
const historyList = document.getElementById('historyList');

// Initialize History from Local Storage
let historyData = JSON.parse(localStorage.getItem('auraHistory')) || [];
renderHistory();

// Sidebar Toggle
historyToggleBtn.addEventListener('click', () => historySidebar.classList.remove('closed'));
closeHistoryBtn.addEventListener('click', () => historySidebar.classList.add('closed'));

// Drag and drop logic
['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); }, false);
});
['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); }, false);
});

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        filePreview.src = e.target.result;
        dropzone.classList.add('hidden');
        filePreviewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    await processFile(file);
});

removeFileBtn.addEventListener('click', () => {
    fileInput.value = '';
    filePreview.src = '';
    filePreviewContainer.classList.add('hidden');
    dropzone.classList.remove('hidden');
    outputEl.classList.add('hidden');
});

async function processFile(file) {
    loadingEl.classList.remove('hidden');
    outputEl.classList.add('hidden');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('framework', frameworkSelect.value); // Send chosen framework

    try {
        const response = await fetch('http://localhost:8000/api/v1/generate-code', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Synthesis failed');
        
        const data = await response.json();
        
        // Update UI
        codeEl.textContent = data.code;
        outputBadge.textContent = data.framework.toUpperCase();
        outputEl.classList.remove('hidden');

        // Save to history
        saveToHistory(data.filename, data.framework, data.code);
        
    } catch (err) {
        console.error('Synthesis error:', err);
        alert('Failed to connect to backend.');
    } finally {
        loadingEl.classList.add('hidden');
    }
}

function saveToHistory(filename, framework, code) {
    const newItem = {
        id: Date.now(),
        filename: filename,
        framework: framework.toUpperCase(),
        codeSnippet: code.substring(0, 50) + '...',
        time: new Date().toLocaleTimeString()
    };
    historyData.unshift(newItem);
    if(historyData.length > 10) historyData.pop(); // Keep only last 10
    
    localStorage.setItem('auraHistory', JSON.stringify(historyData));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';
    historyData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                <strong>${item.framework}</strong>
                <span style="font-size: 0.7rem; color: #6b7280;">${item.time}</span>
            </div>
            <p>${item.filename}</p>
            <code>${item.codeSnippet.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
        `;
        historyList.appendChild(div);
    });
}

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(codeEl.textContent);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy Code'; }, 2000);
});