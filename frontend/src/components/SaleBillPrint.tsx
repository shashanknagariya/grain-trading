import React from 'react';
import { formatDate, formatCurrency } from '../utils/formatters';
import './SaleBillPrint.css';
import { Sale } from '../types/sale';

interface SaleBillPrintProps {
  sale: Sale | null;
}

export const SaleBillPrint: React.FC<SaleBillPrintProps> = ({ sale }) => {
  if (!sale) return null;

  return (
    <div className="bill-print">
      {/* Header */}
      <div className="header">
        <div className="logo-section">
          {/* Make logo optional */}
          {/* <img src={logo} alt="Company Logo" className="company-logo" /> */}
        </div>
        <div className="company-info">
          <h1 className="company-name">BADRI PRASAD MAHESH PRASAD NAGARIYA</h1>
          <p>Ganj chhatarpur mp 471105</p>
          <p>Contact: 7619595475</p>
          <p>Email: nagariya.shashank7@gmail.com</p>
          <p>GSTIN: 23AAXXXYYY8M1ZM</p>
          <p>PAN No: AAXXXYYY</p>
        </div>
      </div>

      <div className="bill-title">BILL OF SUPPLY</div>

      {/* Bill Info Grid */}
      <div className="info-grid">
        <div className="info-section">
          <table className="info-table">
            <tbody>
              <tr>
                <td>Reverse Charge</td>
                <td>:</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Invoice No.</td>
                <td>:</td>
                <td>{sale.bill_number}</td>
              </tr>
              <tr>
                <td>Invoice Date</td>
                <td>:</td>
                <td>{formatDate(new Date(sale.sale_date))}</td>
              </tr>
              <tr>
                <td>State</td>
                <td>:</td>
                <td>Madhya Pradesh</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="info-section">
          <table className="info-table">
            <tbody>
              <tr>
                <td>Transportation Mode</td>
                <td>:</td>
                <td>{sale.transportation_mode}</td>
              </tr>
              <tr>
                <td>Vehicle No.</td>
                <td>:</td>
                <td>{sale.vehicle_number}</td>
              </tr>
              <tr>
                <td>LR Number</td>
                <td>:</td>
                <td>{sale.lr_number || '-'}</td>
              </tr>
              <tr>
                <td>PO Number</td>
                <td>:</td>
                <td>{sale.po_number || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Party Details */}
      <div className="party-details">
        <div className="party-section">
          <h3>Details of Receiver (Billed to):</h3>
          <table className="party-table">
            <tbody>
              <tr>
                <td>Name</td>
                <td>:</td>
                <td>{sale.buyer_name}</td>
              </tr>
              {sale.buyer_gst && (
                <tr>
                  <td>GSTIN</td>
                  <td>:</td>
                  <td>{sale.buyer_gst}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Items Table */}
      <table className="items-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Description of Goods</th>
            <th>HSN/SAC</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="center">1</td>
            <td>{sale.grain_name}</td>
            <td className="center">1001</td>
            <td className="right">{sale.total_weight.toFixed(1)} kg</td>
            <td className="right">{formatCurrency(sale.rate_per_kg)}</td>
            <td className="right">{formatCurrency(sale.total_amount)}</td>
          </tr>
          {/* Empty rows for consistent look */}
          {[...Array(4)].map((_, i) => (
            <tr key={i} className="empty-row">
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="right bold">Total Amount</td>
            <td className="right bold">{formatCurrency(sale.total_amount)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Amount in Words */}
      <div className="amount-in-words">
        Amount in Words: Rupees {numberToWords(sale.total_amount)} Only
      </div>

      {/* Bank Details */}
      <div className="bank-details">
        <h4>Bank Details:</h4>
        <table className="bank-table">
          <tbody>
            <tr>
              <td>Account Holder Name</td>
              <td>:</td>
              <td>Badri Prasad Mahesh Prasad Nagariya</td>
            </tr>
            <tr>
              <td>Bank Account Number</td>
              <td>:</td>
              <td>50200070029384</td>
            </tr>
            <tr>
              <td>Bank IFSC Code</td>
              <td>:</td>
              <td>PUNB0041450</td>
            </tr>
            <tr>
              <td>Bank Name</td>
              <td>:</td>
              <td>Punjab National Bank</td>
            </tr>
            <tr>
              <td>Bank Branch Name</td>
              <td>:</td>
              <td>SATNA, KRISHNA NAGAR</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Terms and Signature */}
      <div className="footer">
        <div className="terms">
          <h4>Terms And Conditions:</h4>
          <ol>
            <li>This is an electronically generated invoice.</li>
            <li>All disputes are subject to Satna jurisdiction.</li>
          </ol>
        </div>
        <div className="signature">
          <p>For, BADRI PRASAD MAHESH PRASAD NAGARIYA</p>
          <div className="signature-space"></div>
          <p>Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert number to words
function numberToWords(num: number): string {
  // Add your number to words conversion logic here
  return ""; // Placeholder
} 