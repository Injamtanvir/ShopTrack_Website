document.addEventListener('DOMContentLoaded', function() {
    const viewInvoiceBtn = document.getElementById('viewInvoiceBtn');
    const shopIdInput = document.getElementById('shopId');
    const invoiceNumberInput = document.getElementById('invoiceNumber');
    const errorMessage = document.getElementById('errorMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const invoiceContainer = document.getElementById('invoiceContainer');
    
    // URL of your backend API that serves invoice data
    const API_BASE_URL = 'https://shoptrack-w8wu.onrender.com/api/';
    
    viewInvoiceBtn.addEventListener('click', function() {
        const shopId = shopIdInput.value.trim();
        const invoiceNumber = invoiceNumberInput.value.trim();
        
        // Clear previous results
        errorMessage.style.display = 'none';
        invoiceContainer.style.display = 'none';
        invoiceContainer.innerHTML = '';
        
        // Validate inputs
        if (!shopId || !invoiceNumber) {
            errorMessage.textContent = 'Please enter both Shop ID and Invoice Number';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        
        // Fetch invoice data from the API
        fetch(`${API_BASE_URL}?shop_id=${shopId}&invoice_number=${invoiceNumber}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Invoice not found');
                }
                return response.json();
            })
            .then(invoice => {
                // Hide loading indicator
                loadingIndicator.style.display = 'none';
                
                // Render the invoice
                renderInvoice(invoice);
                
                // Show the invoice container
                invoiceContainer.style.display = 'block';
            })
            .catch(error => {
                // Hide loading indicator
                loadingIndicator.style.display = 'none';
                
                // Show error message
                errorMessage.textContent = error.message || 'Failed to load invoice';
                errorMessage.style.display = 'block';
            });
    });
    
    function renderInvoice(invoice) {
        // Format date
        const invoiceDate = new Date(invoice.date);
        const formattedDate = invoiceDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create invoice HTML
        const invoiceHTML = `
            <div class="invoice-header">
                <div>
                    <div class="invoice-title">INVOICE</div>
                    <div class="invoice-date">${formattedDate}</div>
                </div>
                <div>
                    <div class="invoice-number"># ${invoice.invoice_number}</div>
                </div>
            </div>
            
            <div class="party-details">
                <div>
                    <h3>From:</h3>
                    <p>${invoice.shop_name}</p>
                    <p>${invoice.shop_address}</p>
                    <p>License: ${invoice.shop_license}</p>
                    <p>Shop ID: ${invoice.shop_id}</p>
                </div>
                <div>
                    <h3>To:</h3>
                    <p>${invoice.customer_name}</p>
                    <p>${invoice.customer_address}</p>
                </div>
            </div>
            
            <table class="invoice-items">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.unit_price.toFixed(2)}</td>
                            <td class="text-right">$${item.total_price.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="invoice-summary">
                <table>
                    ${invoice.subtotal_amount ? `
                        <tr>
                            <td>Subtotal:</td>
                            <td class="text-right">$${invoice.subtotal_amount.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    
                    ${invoice.discount_amount && invoice.discount_amount > 0 ? `
                        <tr>
                            <td>Discount:</td>
                            <td class="text-right">-$${invoice.discount_amount.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    
                    <tr class="total">
                        <td>Total:</td>
                        <td class="text-right">$${invoice.total_amount.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="invoice-footer">
                <p>Thank you for your business!</p>
                <p>Generated using ShopTrack</p>
            </div>
            
            <button class="print-button" onclick="window.print()">Print Invoice</button>
        `;
        
        // Set the HTML to the container
        invoiceContainer.innerHTML = invoiceHTML;
    }
});