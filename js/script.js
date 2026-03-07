// ==================== Configuration ====================
const API_BASE_URL = 'https://phi-lab-server.vercel.app/api/v1/lab';
let allIssues = [];
let currentFilter = 'all';
let searchQuery = '';

// ==================== DOM Elements ====================
const grid = document.getElementById('issues-grid');
const loadingSpinner = document.getElementById('loading-spinner');
const tabButtons = document.querySelectorAll('.tab-btn');
const issueCountSpan = document.getElementById('issue-count');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const modal = document.getElementById('issue-modal');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal');

// ==================== Utility Functions ====================
function showLoading() { loadingSpinner.classList.remove('hidden'); }
function hideLoading() { loadingSpinner.classList.add('hidden'); }

function setActiveTab(tabId) {
    tabButtons.forEach(btn => {
        const btnTab = btn.dataset.tab;
        if (btnTab === tabId) {
            btn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600', 'active');
            btn.classList.remove('text-gray-500');
        } else {
            btn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600', 'active');
            btn.classList.add('text-gray-500');
        }
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; // MM/DD/YYYY
}

function getStatusBorderClass(status) {
    return status?.toLowerCase() === 'open' ? 'border-t-green-500' : 'border-t-purple-500';
}

function getPriorityColor(priority) {
    switch(priority?.toLowerCase()) {
        case 'high': return '#ef4444'; // red
        case 'medium': return '#f59e0b'; // amber
        case 'low': return '#10b981'; // green
        default: return '#6b7280'; // gray
    }
}

// labels array কে HTML চিপস এ রূপান্তর
function renderLabels(labels) {
    if (!labels || labels.length === 0) return '';
    return labels.map(label => 
        `<span class="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded mr-1">${label}</span>`
    ).join('');
}

// ==================== API Calls ====================
async function fetchIssues() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/issues`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const responseData = await response.json();
        console.log('API Response:', responseData);
        
        if (responseData.status === 'success' && Array.isArray(responseData.data)) {
            allIssues = responseData.data;
        } else {
            throw new Error('Unexpected API response structure');
        }
        
        displayIssues();
    } catch (error) {
        console.error('Error fetching issues:', error);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">Failed to load issues.</p>';
    } finally {
        hideLoading();
    }
}

async function searchIssues(query) {
    if (!query.trim()) {
        fetchIssues();
        return;
    }
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/issues/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const responseData = await response.json();
        
        if (responseData.status === 'success' && Array.isArray(responseData.data)) {
            allIssues = responseData.data;
        } else {
            allIssues = [];
        }
        
        displayIssues();
    } catch (error) {
        console.error('Error searching issues:', error);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">Search failed.</p>';
    } finally {
        hideLoading();
    }
}

// ==================== Display Issues ====================
// ==================== Display Issues ====================
function displayIssues() {
    let filteredIssues = allIssues;
    
    if (currentFilter === 'open') {
        filteredIssues = allIssues.filter(issue => issue.status?.toLowerCase() === 'open');
    } else if (currentFilter === 'closed') {
        filteredIssues = allIssues.filter(issue => issue.status?.toLowerCase() === 'closed');
    }

    issueCountSpan.textContent = filteredIssues.length;

    if (filteredIssues.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-500">No issues found.</p>';
        return;
    }

    grid.innerHTML = filteredIssues.map(issue => {
        const priorityColor = getPriorityColor(issue.priority);
        const labelsHtml = renderLabels(issue.labels);
        
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer issue-card" data-issue-id="${issue.id}">
                <div class="border-t-4 ${getStatusBorderClass(issue.status)} p-4">
                    <!-- প্রথম লাইন: আইকন + প্রায়োরিটি (ডান পাশে) -->
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-2xl text-gray-600">📋</span> <!-- আইকন -->
                        <span class="text-xs font-bold uppercase px-2 py-1 rounded" 
                              style="background-color: ${priorityColor}20; color: ${priorityColor}; border: 1px solid ${priorityColor}40;">
                            ${issue.priority?.toUpperCase() || 'N/A'}
                        </span>
                    </div>
                    
                    <!-- টাইটেল -->
                    <h3 class="font-bold text-lg mb-2">${issue.title || 'Untitled'}</h3>
                    
                    <!-- ডেসক্রিপশন (... সহ) -->
                    <p class="text-gray-600 text-sm mb-3">${issue.description?.substring(0, 60) || 'No description.'}...</p>
                    
                    <!-- লেবেল কালারফুল চিপস -->
                    <div class="mb-4 flex flex-wrap gap-2">
                        ${labelsHtml}
                    </div>
                    
                    <!-- ফুটার: দুই লাইনে -->
                    <div class="text-xs text-gray-500 border-t pt-3">
                        <div class="font-medium mb-1">#${issue.id} by ${issue.author || 'unknown'}</div>
                        <div>${formatDate(issue.createdAt)}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Attach click event to each card
    document.querySelectorAll('.issue-card').forEach(card => {
        card.addEventListener('click', () => openModal(card.dataset.issueId));
    });
}

// লেবেল রেন্ডার করার ফাংশন (কালারফুল)
function renderLabels(labels) {
    if (!labels || labels.length === 0) return '';
    
    // লেবেলের জন্য রঙের ম্যাপিং
    const labelColors = {
        'bug': 'bg-red-100 text-red-800 border-red-200',
        'help wanted': 'bg-blue-100 text-blue-800 border-blue-200',
        'feature': 'bg-green-100 text-green-800 border-green-200',
        'documentation': 'bg-purple-100 text-purple-800 border-purple-200',
        'enhancement': 'bg-indigo-100 text-indigo-800 border-indigo-200',
        'question': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return labels.map(label => {
        const labelLower = label.toLowerCase();
        const colorClass = labelColors[labelLower] || 'bg-gray-100 text-gray-800 border-gray-200';
        return `
            <span class="${colorClass} text-xs font-semibold px-3 py-1.5 rounded-full border">
                ${label}
            </span>
        `;
    }).join('');
}

function openModal(issueId) {
    const issue = allIssues.find(i => i.id == issueId);
    if (!issue) return;

    modalContent.innerHTML = `
        <div class="space-y-3">
            <p><strong class="text-gray-700">ID:</strong> ${issue.id}</p>
            <p><strong class="text-gray-700">Title:</strong> ${issue.title}</p>
            <p><strong class="text-gray-700">Description:</strong> ${issue.description}</p>
            <p><strong class="text-gray-700">Status:</strong> ${issue.status}</p>
            <p><strong class="text-gray-700">Labels:</strong> ${issue.labels?.join(', ') || 'N/A'}</p>
            <p><strong class="text-gray-700">Priority:</strong> ${issue.priority}</p>
            <p><strong class="text-gray-700">Author:</strong> ${issue.author}</p>
            <p><strong class="text-gray-700">Assignee:</strong> ${issue.assignee || 'None'}</p>
            <p><strong class="text-gray-700">Created At:</strong> ${formatDate(issue.createdAt)}</p>
            <p><strong class="text-gray-700">Updated At:</strong> ${formatDate(issue.updatedAt)}</p>
        </div>
    `;
    modal.classList.remove('hidden');
}

// ==================== Event Listeners ====================
tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabId = e.target.dataset.tab;
        currentFilter = tabId;
        setActiveTab(tabId);
        displayIssues();
    });
});

searchBtn.addEventListener('click', () => {
    searchQuery = searchInput.value;
    searchIssues(searchQuery);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

// ==================== Initial Fetch ====================
if (window.location.pathname.includes('dashboard') || document.getElementById('issues-grid')) {
    fetchIssues();
}