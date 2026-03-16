// Initialize storage
let currentFile = null;

// Check for existing file on load
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
});

// Handle file upload
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('extensionFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a ZIP file');
        return;
    }
    
    if (!file.name.endsWith('.zip')) {
        alert('Please upload a ZIP file only');
        return;
    }
    
    uploadFile(file);
});

function uploadFile(file) {
    // Show progress bar
    const progressBar = document.getElementById('uploadProgress');
    const progressFill = document.querySelector('.progress-fill');
    progressBar.style.display = 'block';
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Save file to localStorage (actually we store metadata, file is in memory)
            setTimeout(() => {
                saveFileToStorage(file);
                progressBar.style.display = 'none';
                progressFill.style.width = '0%';
                document.getElementById('uploadForm').reset();
            }, 500);
        }
    }, 100);
}

function saveFileToStorage(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            content: e.target.result, // Base64 content
            uploadTime: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('extensionFile', JSON.stringify(fileData));
        currentFile = fileData;
        
        // Update UI
        displayExtensionInfo(fileData);
        
        // Show success message
        alert('Extension uploaded successfully!');
    };
    
    reader.readAsDataURL(file); // Read as base64
}

function loadFromStorage() {
    const stored = localStorage.getItem('extensionFile');
    
    if (stored) {
        try {
            currentFile = JSON.parse(stored);
            displayExtensionInfo(currentFile);
        } catch (e) {
            console.error('Error loading from storage:', e);
        }
    }
}

function displayExtensionInfo(file) {
    const noExtension = document.getElementById('noExtension');
    const extensionInfo = document.getElementById('extensionInfo');
    
    noExtension.style.display = 'none';
    extensionInfo.style.display = 'block';
    
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('uploadTime').textContent = 'Uploaded: ' + new Date(file.uploadTime).toLocaleString();
    
    // Setup download link
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = file.content;
    downloadLink.download = file.name;
    
    // Setup share link
    const shareUrl = window.location.href + '?download=' + encodeURIComponent(file.name);
    document.getElementById('shareLink').value = shareUrl;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Copy link functionality
document.getElementById('copyLinkBtn').addEventListener('click', function() {
    copyToClipboard(document.getElementById('shareLink').value);
});

document.getElementById('copyShareBtn').addEventListener('click', function() {
    copyToClipboard(document.getElementById('shareLink').value);
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Link copied to clipboard!');
    });
}

// Delete functionality
document.getElementById('deleteBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete the extension?')) {
        localStorage.removeItem('extensionFile');
        currentFile = null;
        
        document.getElementById('noExtension').style.display = 'block';
        document.getElementById('extensionInfo').style.display = 'none';
        
        alert('Extension deleted successfully!');
    }
});

// Handle download from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const downloadParam = urlParams.get('download');

if (downloadParam) {
    const stored = localStorage.getItem('extensionFile');
    if (stored) {
        const file = JSON.parse(stored);
        if (file.name === downloadParam) {
            // Auto-download
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = file.content;
                a.download = file.name;
                a.click();
            }, 1000);
        }
    }
}
