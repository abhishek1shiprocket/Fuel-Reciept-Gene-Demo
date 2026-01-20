// Get all form elements
const form = document.getElementById('receiptForm');
const generateBtn = document.getElementById('generateBtn');
const printBtn = document.getElementById('printBtn');
const clearBtn = document.getElementById('clearBtn');
const generateYearlyBtn = document.getElementById('generateYearlyBtn');
const clearYearlyBtn = document.getElementById('clearYearlyBtn');
const downloadYearlyZipBtn = document.getElementById('downloadYearlyZipBtn');

let yearlyReceiptsCache = [];

// Auto-update receipt preview on input change
const formInputs = form.querySelectorAll('input, select');
formInputs.forEach(input => {
    input.addEventListener('input', updateReceiptPreview);
    input.addEventListener('change', updateReceiptPreview);
});

// Calculate volume automatically when amount or rate changes
const amountInput = document.getElementById('amount');
const rateInput = document.getElementById('ratePerLtr');
const volumeInput = document.getElementById('volume');

function calculateVolume() {
    const amount = parseFloat(amountInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    
    if (rate > 0) {
        const volume = (amount / rate).toFixed(2);
        volumeInput.value = volume + 'L';
        updateReceiptPreview();
    }
}

amountInput.addEventListener('input', calculateVolume);
rateInput.addEventListener('input', calculateVolume);

// Update receipt preview with animation
function updateReceiptPreview() {
    const fields = {
        'stationName': 'preview2-stationName',
        'address': 'preview2-address',
        'telNo': 'preview2-telNo',
        'receiptNo': 'preview2-receiptNo',
        'fccId': 'preview2-fccId',
        'fipNo': 'preview2-fipNo',
        'nozzleNo': 'preview2-nozzleNo',
        'product': 'preview2-product',
        'ratePerLtr': 'preview2-ratePerLtr',
        'amount': 'preview2-amount',
        'volume': 'preview2-volume',
        'vehType': 'preview2-vehType',
        'vehNo': 'preview2-vehNo',
        'customerName': 'preview2-customerName',
        'date': 'preview2-date',
        'mode': 'preview2-mode',
        'lstNo': 'preview2-lstNo',
        'vatNo': 'preview2-vatNo',
        'attendantId': 'preview2-attendantId'
    };
    
    for (const [inputId, previewId] of Object.entries(fields)) {
        const input = document.getElementById(inputId);
        
        if (input) {
            let value = input.value;
            
            // Format numbers with 2 decimal places
            if (inputId === 'ratePerLtr' && value) {
                value = parseFloat(value).toFixed(2);
            } else if (inputId === 'amount' && value) {
                value = parseFloat(value).toFixed(2);
            } else if (inputId === 'volume' && value && !value.endsWith('L')) {
                // Ensure volume has the "L" suffix if it doesn't already
                value = value + ' L';
            }
            
            // Update preview
            const preview = document.getElementById(previewId);
            if (preview) {
                // Add animation when value changes
                if (preview.textContent !== (value || '')) {
                    preview.style.opacity = '0.5';
                    preview.style.transform = 'translateX(-5px)';
                    
                    setTimeout(() => {
                        preview.textContent = value || '';
                        preview.style.opacity = '1';
                        preview.style.transform = 'translateX(0)';
                    }, 100);
                } else {
                    preview.textContent = value || '';
                }
            }
        }
    }
    
    // Add subtle pulse to receipt when updated
    const receipt = document.getElementById('receipt-type2');
    if (receipt) {
        receipt.style.animation = 'none';
        setTimeout(() => {
            receipt.style.animation = 'pulse 0.3s ease';
        }, 10);
    }
}

// Generate receipt button with visual feedback
generateBtn.addEventListener('click', async function() {
    // Add loading state
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.7';
    
    const formData = getFormData();
    
    try {
        const response = await fetch('/api/generate-receipt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const data = await response.json();
            updateReceiptFromData(data);
            
            // Visual feedback
            const receipt = document.getElementById('receipt-type2');
            if (receipt) {
                receipt.style.animation = 'pulse 0.5s ease';
            }
            
            // Show success message
            showNotification('Receipt generated successfully!', 'success');
        } else {
            showNotification('Error generating receipt. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        // Fallback: just update preview locally
        updateReceiptPreview();
        showNotification('Receipt updated! (Using local preview)', 'success');
    } finally {
        // Reset button
        generateBtn.textContent = 'Generate Receipt';
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
    }
});

// Get form data
function getFormData() {
    return {
        stationName: document.getElementById('stationName').value,
        address: document.getElementById('address').value,
        telNo: document.getElementById('telNo').value,
        receiptNo: document.getElementById('receiptNo').value,
        fccId: document.getElementById('fccId').value,
        fipNo: document.getElementById('fipNo').value,
        nozzleNo: document.getElementById('nozzleNo').value,
        product: document.getElementById('product').value,
        ratePerLtr: document.getElementById('ratePerLtr').value,
        amount: document.getElementById('amount').value,
        volume: document.getElementById('volume').value,
        vehType: document.getElementById('vehType').value,
        vehNo: document.getElementById('vehNo').value,
        customerName: document.getElementById('customerName').value,
        date: document.getElementById('date').value,
        mode: document.getElementById('mode').value,
        lstNo: document.getElementById('lstNo').value,
        vatNo: document.getElementById('vatNo').value,
        attendantId: document.getElementById('attendantId').value
    };
}

// Update receipt from data
function updateReceiptFromData(data) {
    if (data.stationName) document.getElementById('stationName').value = data.stationName;
    if (data.address) document.getElementById('address').value = data.address;
    if (data.telNo) document.getElementById('telNo').value = data.telNo;
    if (data.receiptNo) document.getElementById('receiptNo').value = data.receiptNo;
    if (data.fccId !== undefined) document.getElementById('fccId').value = data.fccId;
    if (data.fipNo !== undefined) document.getElementById('fipNo').value = data.fipNo;
    if (data.nozzleNo !== undefined) document.getElementById('nozzleNo').value = data.nozzleNo;
    if (data.product) document.getElementById('product').value = data.product;
    if (data.ratePerLtr) document.getElementById('ratePerLtr').value = data.ratePerLtr;
    if (data.amount) document.getElementById('amount').value = data.amount;
    if (data.volume) document.getElementById('volume').value = data.volume;
    if (data.vehType) document.getElementById('vehType').value = data.vehType;
    if (data.vehNo !== undefined) document.getElementById('vehNo').value = data.vehNo;
    if (data.customerName !== undefined) document.getElementById('customerName').value = data.customerName;
    if (data.date) document.getElementById('date').value = data.date;
    if (data.mode) document.getElementById('mode').value = data.mode;
    if (data.lstNo !== undefined) document.getElementById('lstNo').value = data.lstNo;
    if (data.vatNo !== undefined) document.getElementById('vatNo').value = data.vatNo;
    if (data.attendantId !== undefined) document.getElementById('attendantId').value = data.attendantId;
    
    updateReceiptPreview();
}

// Export receipt as image (PNG) instead of printing PDF
printBtn.addEventListener('click', function() {
    const receipt = document.getElementById('receipt-type2');
    if (!receipt) return;

    // Visual feedback on button
    printBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        printBtn.style.transform = 'scale(1)';
    }, 150);

    // Use html2canvas to capture the receipt DOM as an image
    html2canvas(receipt, {
        scale: 2,
        useCORS: true
    }).then(canvas => {
        // Convert the whole canvas to grayscale so the logo (and receipt)
        // are exported in black & white
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = data[i + 1] = data[i + 2] = gray;
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(function(blob) {
            if (!blob) {
                showNotification('Could not export receipt image.', 'error');
                return;
            }

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'fuel-receipt.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            showNotification('Receipt image downloaded!', 'success');
        }, 'image/png');
    }).catch(error => {
        console.error('Error exporting image:', error);
        showNotification('Failed to export receipt image.', 'error');
    });
});

// Clear all button
clearBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all fields?')) {
        form.reset();
        
        // Reset to default values
        document.getElementById('stationName').value = 'Rajasthan Rajpath Filling Station';
        document.getElementById('address').value = 'Address Lock No 349, NH 8 Samalkha New Delhi - 110037';
        document.getElementById('telNo').value = '1503339';
        document.getElementById('receiptNo').value = '159955';
        document.getElementById('product').value = 'Petrol';
        document.getElementById('ratePerLtr').value = '94.72';
        document.getElementById('amount').value = '5000';
        document.getElementById('volume').value = '52.79L';
        document.getElementById('vehType').value = 'Petrol';
        document.getElementById('mode').value = 'Cash';
        document.getElementById('attendantId').value = 'not available';
        
        // Set current date/time
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 16).replace('T', ' ');
        document.getElementById('date').value = dateStr;
        
        updateReceiptPreview();
    }
});

// ------- Yearly automation helpers -------

function setYearlyDefaults() {
    const yearInput = document.getElementById('yearlyYear');
    if (yearInput && !yearInput.value) {
        const now = new Date();
        yearInput.value = now.getFullYear();
    }
}

async function generateYearlyReceipts() {
    const year = parseInt(document.getElementById('yearlyYear').value || new Date().getFullYear(), 10);
    const monthlyCap = parseFloat(document.getElementById('yearlyMonthlyCap').value || '25000');
    const minAmount = parseFloat(document.getElementById('yearlyMinAmount').value || '3000');
    const maxAmount = parseFloat(document.getElementById('yearlyMaxAmount').value || '7000');
    const location = (document.getElementById('yearlyLocation').value || 'delhi').trim() || 'delhi';
    const apiKey = (document.getElementById('yearlyApiKey').value || '').trim();
    const yearlyTelNo = (document.getElementById('yearlyTelNo').value || '').trim();
    const yearlyCustomerName = (document.getElementById('yearlyCustomerName').value || '').trim();
    const yearlyVehNo = (document.getElementById('yearlyVehNo').value || '').trim();

    if (isNaN(minAmount) || isNaN(maxAmount) || minAmount <= 0 || maxAmount <= 0 || maxAmount < minAmount) {
        showNotification('Please enter a valid min/max amount range.', 'error');
        return;
    }

    if (isNaN(monthlyCap) || monthlyCap <= 0) {
        showNotification('Please enter a valid monthly cap.', 'error');
        return;
    }

    if (!apiKey) {
        showNotification('Please enter your Fuel API key.', 'error');
        return;
    }

    if (!generateYearlyBtn) return;
    generateYearlyBtn.textContent = 'Generating...';
    generateYearlyBtn.disabled = true;
    generateYearlyBtn.style.opacity = '0.7';

    try {
        const resp = await fetch('/api/generate-yearly-receipts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                year,
                monthly_cap: monthlyCap,
                min_amount: minAmount,
                max_amount: maxAmount,
                location,
                fuel_api_key: apiKey,
                telNo: yearlyTelNo,
                customerName: yearlyCustomerName,
                vehNo: yearlyVehNo,
            }),
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            const msg = err.error || 'Failed to generate yearly receipts.';
            showNotification(msg, 'error');
            return;
        }

        const data = await resp.json();
        renderYearlyResults(data);
        showNotification('Yearly receipts generated.', 'success');
    } catch (e) {
        console.error(e);
        showNotification('Error while generating yearly receipts.', 'error');
    } finally {
        generateYearlyBtn.textContent = 'Generate Yearly Receipts';
        generateYearlyBtn.disabled = false;
        generateYearlyBtn.style.opacity = '1';
    }
}

function renderYearlyResults(data) {
    const container = document.getElementById('yearlyResults');
    if (!container) return;

    const receipts = (data && data.receipts) || [];
    yearlyReceiptsCache = receipts;
    if (!receipts.length) {
        container.innerHTML = '<p>No receipts generated for the given settings.</p>';
        return;
    }

    let html = '<table><thead><tr>' +
        '<th>Month</th><th>Date</th><th>Station</th><th>Amount (₹)</th>' +
        '<th>Rate/Ltr</th><th>Volume (L)</th><th>Action</th></tr></thead><tbody>';

    receipts.forEach((r, index) => {
        const monthName = new Date(r.date.replace(' ', 'T')).toLocaleString('en-IN', { month: 'short' });
        const volumeDisplay = (r.volume || '').toString().replace('L', '');
        html += `<tr data-index="${index}">` +
            `<td>${monthName}</td>` +
            `<td>${r.date}</td>` +
            `<td>${r.stationName}</td>` +
            `<td>${r.amount}</td>` +
            `<td>${r.ratePerLtr}</td>` +
            `<td>${volumeDisplay}</td>` +
            `<td><button type="button" class="use-btn" data-index="${index}">Use</button></td>` +
            `</tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    const useButtons = container.querySelectorAll('.use-btn');
    useButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-index'), 10);
            const receipt = receipts[idx];
            if (!receipt) return;
            updateReceiptFromData(receipt);
            showNotification('Loaded yearly receipt into main form.', 'success');
        });
    });
}

function clearYearlyForm() {
    const form = document.getElementById('yearlyForm');
    if (!form) return;
    form.reset();
    setYearlyDefaults();
    const results = document.getElementById('yearlyResults');
    if (results) {
        results.innerHTML = '';
    }
}

if (generateYearlyBtn) {
    generateYearlyBtn.addEventListener('click', generateYearlyReceipts);
}

if (clearYearlyBtn) {
    clearYearlyBtn.addEventListener('click', clearYearlyForm);
}

async function captureReceiptAsBlob(filenamePrefix) {
    const receipt = document.getElementById('receipt-type2');
    if (!receipt || typeof html2canvas === 'undefined') {
        throw new Error('Receipt element or html2canvas not available');
    }

    // Allow DOM to settle after updating fields
    await new Promise(res => setTimeout(res, 150));

    const canvas = await html2canvas(receipt, {
        scale: 2,
        useCORS: true,
    });

    // Convert captured image to grayscale (same logic as single export)
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = data[i + 1] = data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) {
                reject(new Error('Failed to create image blob'));
                return;
            }
            resolve(blob);
        }, 'image/png');
    });
}

async function downloadYearlyZip() {
    if (!yearlyReceiptsCache || yearlyReceiptsCache.length === 0) {
        showNotification('Please generate yearly receipts first.', 'error');
        return;
    }

    if (typeof JSZip === 'undefined') {
        showNotification('ZIP library not loaded.', 'error');
        return;
    }

    const zip = new JSZip();

    // Add CSV summary
    const csvLines = [];
    csvLines.push('Date,Description,Invoice Details,Amount');
    yearlyReceiptsCache.forEach(r => {
        const date = r.date || '';
        const description = `Fuel purchase on ${date} receipt no. ${r.receiptNo || ''} from ${r.stationName || ''}`.trim();
        const invoiceDetails = `Receipt ${r.receiptNo || ''}`.trim();
        const amount = r.amount || '';

        function esc(val) {
            const s = String(val ?? '');
            if (s.includes('"') || s.includes(',') || s.includes('\n')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        }

        csvLines.push([esc(date), esc(description), esc(invoiceDetails), esc(amount)].join(','));
    });
    const csvContent = csvLines.join('\n');
    zip.file('summary.csv', csvContent);

    downloadYearlyZipBtn.textContent = 'Preparing ZIP...';
    downloadYearlyZipBtn.disabled = true;
    downloadYearlyZipBtn.style.opacity = '0.7';

    try {
        for (let i = 0; i < yearlyReceiptsCache.length; i += 1) {
            const r = yearlyReceiptsCache[i];
            // Update main form and preview with this receipt
            updateReceiptFromData(r);

            const safeMonth = new Date(r.date.replace(' ', 'T')).toISOString().slice(0, 7); // YYYY-MM
            const idxStr = String(i + 1).padStart(3, '0');
            const filename = `receipt-${safeMonth}-${idxStr}.png`;

            // Capture receipt as PNG blob and add to ZIP
            // eslint-disable-next-line no-await-in-loop
            const blob = await captureReceiptAsBlob(filename);
            zip.file(filename, blob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = 'fuel-receipts-yearly.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showNotification('ZIP with all receipts downloaded!', 'success');
    } catch (e) {
        console.error('Error generating ZIP:', e);
        showNotification('Failed to generate ZIP of receipts.', 'error');
    } finally {
        downloadYearlyZipBtn.textContent = 'Download All Receipts (ZIP)';
        downloadYearlyZipBtn.disabled = false;
        downloadYearlyZipBtn.style.opacity = '1';
    }
}

if (downloadYearlyZipBtn) {
    downloadYearlyZipBtn.addEventListener('click', downloadYearlyZip);
}

// Initialize with current date/time
window.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    if (!dateInput.value) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 16).replace('T', ' ');
        dateInput.value = dateStr;
    }
    
    updateReceiptPreview();
    setYearlyDefaults();

    // Disclaimer accordion toggle
    const disclaimerContent = document.getElementById('legalDisclaimerContent');
    const disclaimerToggleBtn = document.getElementById('disclaimerToggleBtn');
    const disclaimerHeader = document.querySelector('.legal-disclaimer-header');

    function toggleDisclaimer() {
        if (!disclaimerContent || !disclaimerToggleBtn) return;
        const isOpen = disclaimerContent.classList.toggle('open');

        if (isOpen) {
            disclaimerToggleBtn.classList.add('open');
            disclaimerToggleBtn.textContent = 'Hide disclaimer';
            disclaimerContent.style.maxHeight = disclaimerContent.scrollHeight + 'px';
        } else {
            disclaimerToggleBtn.classList.remove('open');
            disclaimerToggleBtn.textContent = 'Read full disclaimer';
            disclaimerContent.style.maxHeight = '0';
        }
    }

    if (disclaimerToggleBtn) {
        disclaimerToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDisclaimer();
        });
    }

    if (disclaimerHeader) {
        disclaimerHeader.addEventListener('click', function(e) {
            // Avoid double-toggle when clicking the button itself
            if (e.target === disclaimerToggleBtn) return;
            toggleDisclaimer();
        });
    }
});

// Auto-generate receipt number (optional enhancement)
function generateReceiptNumber() {
    const receiptNoInput = document.getElementById('receiptNo');
    if (!receiptNoInput.value) {
        const randomNum = Math.floor(Math.random() * 999999) + 100000;
        receiptNoInput.value = randomNum.toString();
        updateReceiptPreview();
    }
}

// Generate receipt number on page load if empty
window.addEventListener('DOMContentLoaded', generateReceiptNumber);

// Notification system
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-family: 'Courier New', monospace;
        font-weight: bold;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification animations to CSS via style tag
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
