// CRM System Main JavaScript File

$(document).ready(function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Initialize charts
    initializeCharts();

    // Setup table interactions
    setupTableInteractions();

    // Setup form validations
    setupFormValidations();

    // Setup real-time updates
    setupRealTimeUpdates();

    // Add animations
    addAnimations();
});

// Chart initialization
function initializeCharts() {
    // Status Chart
    var statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Resolved', 'Pending', 'In Progress', 'Closed'],
                datasets: [{
                    data: [1892, 423, 141, 0],
                    backgroundColor: [
                        '#28a745',
                        '#ffc107',
                        '#17a2b8',
                        '#6c757d'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    // Priority Chart
    var priorityCtx = document.getElementById('priorityChart');
    if (priorityCtx) {
        new Chart(priorityCtx, {
            type: 'bar',
            data: {
                labels: ['High', 'Medium', 'Low'],
                datasets: [{
                    label: 'Number of Tickets',
                    data: [141, 423, 1892],
                    backgroundColor: [
                        '#dc3545',
                        '#ffc107',
                        '#28a745'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Table interactions
function setupTableInteractions() {
    // Row hover effects
    $('#ticketsTable tbody tr').hover(
        function() {
            $(this).addClass('table-active');
        },
        function() {
            $(this).removeClass('table-active');
        }
    );

    // Row click handler
    $('#ticketsTable tbody tr').click(function() {
        var ticketId = $(this).find('td:first').text();
        viewTicket(ticketId);
    });
}

// Form validations
function setupFormValidations() {
    // Ticket form validation
    $('#ticketForm').on('submit', function(e) {
        e.preventDefault();
        
        if (validateTicketForm()) {
            submitTicket();
        }
    });

    // Real-time validation
    $('#ticketForm input, #ticketForm textarea, #ticketForm select').on('input blur', function() {
        validateField($(this));
    });
}

// Validate ticket form
function validateTicketForm() {
    var isValid = true;
    var requiredFields = $('#ticketForm [required]');
    
    requiredFields.each(function() {
        if (!validateField($(this))) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate individual field
function validateField($field) {
    var value = $field.val().trim();
    var fieldId = $field.attr('id');
    var isValid = true;
    
    // Remove previous error states
    $field.removeClass('is-invalid is-valid');
    $field.siblings('.invalid-feedback').remove();
    
    // Validation rules
    if ($field.prop('required') && !value) {
        showFieldError($field, 'This field is required');
        isValid = false;
    } else if (fieldId === 'email' && value && !isValidEmail(value)) {
        showFieldError($field, 'Please enter a valid email address');
        isValid = false;
    } else if (fieldId === 'phone' && value && !isValidPhone(value)) {
        showFieldError($field, 'Please enter a valid phone number');
        isValid = false;
    } else {
        $field.addClass('is-valid');
    }
    
    return isValid;
}

// Show field error
function showFieldError($field, message) {
    $field.addClass('is-invalid');
    $field.after('<div class="invalid-feedback">' + message + '</div>');
}

// Email validation
function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    var phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Submit ticket
function submitTicket() {
    var formData = $('#ticketForm').serialize();
    
    // Show loading state
    $('#submitBtn').prop('disabled', true).html('<span class="spinner"></span> Submitting...');
    
    // Simulate API call
    $.ajax({
        url: '/api/tickets',
        method: 'POST',
        data: formData,
        success: function(response) {
            showAlert('success', 'Ticket submitted successfully!');
            $('#ticketForm')[0].reset();
            $('#ticketForm .form-control').removeClass('is-valid is-invalid');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 2000);
        },
        error: function(xhr, status, error) {
            showAlert('danger', 'Error submitting ticket. Please try again.');
        },
        complete: function() {
            $('#submitBtn').prop('disabled', false).html('Submit Ticket');
        }
    });
}

// View ticket details
function viewTicket(ticketId) {
    // Show loading modal
    showLoadingModal();
    
    // Simulate API call to get ticket details
    $.ajax({
        url: '/api/tickets/' + ticketId,
        method: 'GET',
        success: function(ticket) {
            hideLoadingModal();
            showTicketModal(ticket);
        },
        error: function() {
            hideLoadingModal();
            showAlert('danger', 'Error loading ticket details.');
        }
    });
}

// Edit ticket
function editTicket(ticketId) {
    window.location.href = 'edit-ticket.html?id=' + ticketId;
}

// Show ticket modal
function showTicketModal(ticket) {
    var modalHtml = `
        <div class="modal fade" id="ticketModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Ticket Details - ${ticket.id}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Customer:</strong> ${ticket.customer}</p>
                                <p><strong>Email:</strong> ${ticket.email}</p>
                                <p><strong>Phone:</strong> ${ticket.phone}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Priority:</strong> <span class="badge bg-${getPriorityColor(ticket.priority)}">${ticket.priority}</span></p>
                                <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(ticket.status)}">${ticket.status}</span></p>
                                <p><strong>Date:</strong> ${ticket.date}</p>
                            </div>
                        </div>
                        <hr>
                        <h6>Subject</h6>
                        <p>${ticket.subject}</p>
                        <h6>Description</h6>
                        <p>${ticket.description}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="editTicket('${ticket.id}')">Edit</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(modalHtml);
    var modal = new bootstrap.Modal(document.getElementById('ticketModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    $('#ticketModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

// Get priority color
function getPriorityColor(priority) {
    switch(priority.toLowerCase()) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'secondary';
    }
}

// Get status color
function getStatusColor(status) {
    switch(status.toLowerCase()) {
        case 'resolved': return 'success';
        case 'pending': return 'warning';
        case 'in progress': return 'info';
        case 'closed': return 'secondary';
        default: return 'secondary';
    }
}

// Show alert
function showAlert(type, message) {
    var alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed" style="top: 70px; right: 20px; z-index: 1050; min-width: 300px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    $('body').append(alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(function() {
        $('.alert').alert('close');
    }, 5000);
}

// Show loading modal
function showLoadingModal() {
    var modalHtml = `
        <div class="modal fade" id="loadingModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-sm modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center py-4">
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(modalHtml);
    var modal = new bootstrap.Modal(document.getElementById('loadingModal'));
    modal.show();
}

// Hide loading modal
function hideLoadingModal() {
    $('#loadingModal').modal('hide');
    $('#loadingModal').on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

// Real-time updates simulation
function setupRealTimeUpdates() {
    // Simulate real-time ticket updates
    setInterval(function() {
        updateRandomStats();
    }, 30000); // Update every 30 seconds
}

// Update random stats
function updateRandomStats() {
    // Simulate ticket count changes
    var $totalTickets = $('.card-body .h5:contains("2,456")');
    var currentTotal = parseInt($totalTickets.text().replace(',', ''));
    var change = Math.floor(Math.random() * 5) - 2; // Random change between -2 and 2
    var newTotal = Math.max(0, currentTotal + change);
    
    $totalTickets.text(newTotal.toLocaleString());
    
    // Add animation
    $totalTickets.parent().parent().addClass('fade-in');
}

// Add animations
function addAnimations() {
    // Animate cards on scroll
    $('.card').each(function(index) {
        $(this).delay(index * 100).addClass('fade-in');
    });
    
    // Animate table rows
    $('#ticketsTable tbody tr').each(function(index) {
        $(this).delay(index * 50).addClass('fade-in');
    });
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality
function setupSearch() {
    $('#searchInput').on('input', debounce(function() {
        var searchTerm = $(this).val().toLowerCase();
        
        $('#ticketsTable tbody tr').each(function() {
            var $row = $(this);
            var rowText = $row.text().toLowerCase();
            
            if (rowText.includes(searchTerm)) {
                $row.show();
            } else {
                $row.hide();
            }
        });
    }, 300));
}

// Export functionality
function exportData(format) {
    var data = [];
    
    $('#ticketsTable tbody tr').each(function() {
        var $row = $(this);
        var rowData = {
            id: $row.find('td:eq(0)').text(),
            customer: $row.find('td:eq(1)').text(),
            subject: $row.find('td:eq(2)').text(),
            priority: $row.find('td:eq(3)').text(),
            status: $row.find('td:eq(4)').text(),
            date: $row.find('td:eq(5)').text()
        };
        data.push(rowData);
    });
    
    if (format === 'csv') {
        exportToCSV(data);
    } else if (format === 'json') {
        exportToJSON(data);
    }
}

function exportToCSV(data) {
    var csv = 'Ticket ID,Customer,Subject,Priority,Status,Date\n';
    
    data.forEach(function(row) {
        csv += `"${row.id}","${row.customer}","${row.subject}","${row.priority}","${row.status}","${row.date}"\n`;
    });
    
    downloadFile(csv, 'tickets.csv', 'text/csv');
}

function exportToJSON(data) {
    var json = JSON.stringify(data, null, 2);
    downloadFile(json, 'tickets.json', 'application/json');
}

function downloadFile(content, filename, contentType) {
    var blob = new Blob([content], { type: contentType });
    var url = URL.createObjectURL(blob);
    
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- Tickets page helpers and cross-page 'open tickets' handler ---
function attachOpenTicketsHandler(){
        document.querySelectorAll('[data-action="open-tickets"]').forEach(function(el){
                el.addEventListener('click', function(e){
                        e.preventDefault();
                        var ids = new Set();
                        document.querySelectorAll('[data-ticket-id]').forEach(function(n){
                                var v = n.getAttribute('data-ticket-id') || n.textContent.trim();
                                if(v) ids.add(v.replace(/^#?/, ''));
                        });
                        document.querySelectorAll('.ticket-ref').forEach(function(n){
                                var v = n.textContent.trim(); if(v) ids.add(v.replace(/^#?/, ''));
                        });
                        var q = '';
                        if(ids.size > 0){ q = '?highlight=' + Array.from(ids).slice(0,20).join(','); }
                        window.location.href = 'tickets.html' + q;
                });
        });
}

if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachOpenTicketsHandler);
} else {
        attachOpenTicketsHandler();
}

function initTicketsPage(){
        const searchInput = document.getElementById('searchInput');
        const typeSelect = document.getElementById('typeSelect');
        const deptSelect = document.getElementById('deptSelect');
        const idInput = document.getElementById('idInput');
        const table = document.getElementById('ticketsTable');
        if(!table) return;
        const tbody = table.querySelector('tbody');
        const raiseBtn = document.getElementById('raiseBtn');
        const reassignBtn = document.getElementById('reassignBtn');
        const clearBtn = document.getElementById('clearFilters');
        const selectAll = document.getElementById('selectAll');

        function applyFilters(){
            const q = (searchInput && searchInput.value || '').trim().toLowerCase();
            const type = (typeSelect && typeSelect.value) || '';
            const dept = (deptSelect && deptSelect.value) || '';
            const idq = (idInput && idInput.value || '').trim().toLowerCase();

            [...tbody.rows].forEach(row => {
                const title = (row.cells[2].textContent||'').toLowerCase();
                const issue = (row.cells[3].textContent||'').toLowerCase();
                const rowType = (row.getAttribute('data-type')||'');
                const rowDept = (row.getAttribute('data-dept')||'');
                const rowId = (row.getAttribute('data-id')||'');

                let visible = true;
                if(q && !(title.includes(q) || issue.includes(q))) visible = false;
                if(type && rowType !== type) visible = false;
                if(dept && rowDept !== dept) visible = false;
                if(idq && !rowId.toLowerCase().includes(idq)) visible = false;

                row.style.display = visible ? '' : 'none';
            });
        }

        if(searchInput) searchInput.addEventListener('input', applyFilters);
        if(typeSelect) typeSelect.addEventListener('change', applyFilters);
        if(deptSelect) deptSelect.addEventListener('change', applyFilters);
        if(idInput) idInput.addEventListener('input', applyFilters);
        if(clearBtn) clearBtn.addEventListener('click', () => { if(searchInput) searchInput.value=''; if(typeSelect) typeSelect.value=''; if(deptSelect) deptSelect.value=''; if(idInput) idInput.value=''; applyFilters(); });

        if(raiseBtn) raiseBtn.addEventListener('click', () => { window.location.href = 'add-ticket.html'; });

        if(reassignBtn) reassignBtn.addEventListener('click', () => {
            const checked = [...document.querySelectorAll('.rowCheck')].filter(cb => cb.checked);
            if(checked.length === 0){ alert('Select at least one ticket to reassign.'); return; }
            const ids = checked.map(cb => cb.closest('tr').getAttribute('data-id'));
            const target = prompt('Enter department to reassign selected tickets ('+ids.join(', ')+') to:');
            if(!target) return;
            checked.forEach(cb => {
                const tr = cb.closest('tr');
                tr.cells[6].textContent = target;
                tr.setAttribute('data-dept', target);
            });
            alert('Reassigned '+ids.length+' ticket(s) to '+target+'.');
            applyFilters();
        });

        if(selectAll) selectAll.addEventListener('change', (e) => {
            const visibleChecks = [...document.querySelectorAll('.rowCheck')].filter(cb => cb.closest('tr').style.display !== 'none');
            visibleChecks.forEach(cb => cb.checked = e.target.checked);
        });

        // row view buttons
        table.addEventListener('click', (e) => {
            if(e.target.classList.contains('viewBtn')){
                const tr = e.target.closest('tr');
                const id = tr.getAttribute('data-id');
                alert('Open details for '+id);
            }
        });

        // Highlight rows if 'highlight' param is present (comma-separated IDs)
        function applyHighlightsFromQuery(){
            const params = new URLSearchParams(window.location.search);
            const h = params.get('highlight');
            if(!h) return;
            const ids = h.split(',').map(s=>s.trim().toUpperCase()).filter(Boolean);
            if(ids.length===0) return;
            let first = null;
            [...tbody.rows].forEach(row => {
                const rid = (row.getAttribute('data-id')||'').toUpperCase();
                if(ids.includes(rid)){
                    row.classList.add('highlight');
                    if(!first) first = row;
                }
            });
            if(first) first.scrollIntoView({behavior:'smooth', block:'center'});
        }

        applyHighlightsFromQuery();
}

// Auto-initialize tickets page when body has tickets-page class
if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function(){ if(document.body.classList.contains('tickets-page')) initTicketsPage(); });
} else {
        if(document.body.classList.contains('tickets-page')) initTicketsPage();
}
