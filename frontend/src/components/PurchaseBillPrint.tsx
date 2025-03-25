import React from 'react';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Purchase } from '../types/purchase';
import './PurchaseBillPrint.css'; // You'll need to create this CSS file

interface PurchaseBillPrintProps {
  purchase: Purchase | null;
}

export const PurchaseBillPrint: React.FC<PurchaseBillPrintProps> = ({ purchase }) => {
  if (!purchase) return null;

  return (
    <div className="bill-print">
      {/* Header */}
      <div className="header">
        <div className="company-info">
          <h1 className="company-name">BADRI PRASAD MAHESH PRASAD NAGARIYA</h1>
          <p>Ganj chhatarpur mp 471105</p>
          <p>Contact: 7619595475</p>
          <p>Email: nagariya.shashank7@gmail.com</p>
          <p>GSTIN: 23AAXXXYYY8M1ZM</p>
          <p>PAN No: AAXXXYYY</p>
        </div>
      </div>

      <div className="bill-title">PURCHASE RECEIPT</div>

      {/* Bill Info Grid */}
      <div className="info-grid">
        <div className="info-section">
          <table className="info-table">
            <tbody>
              <tr>
                <td>Purchase Date</td>
                <td>:</td>
                <td>{formatDate(new Date(purchase.purchase_date))}</td>
              </tr>
              <tr>
                <td>Transportation Mode</td>
                <td>:</td>
                <td>{purchase.transportation_mode}</td>
              </tr>
              <tr>
                <td>Vehicle Number</td>
                <td>:</td>
                <td>{purchase.vehicle_number}</td>
              </tr>
              {purchase.lr_number && (
                <tr>
                  <td>LR Number</td>
                  <td>:</td>
                  <td>{purchase.lr_number}</td>
                </tr>
              )}
              {purchase.po_number && (
                <tr>
                  <td>PO Number</td>
                  <td>:</td>
                  <td>{purchase.po_number}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Details */}
      <div className="party-details">
        <div className="party-section">
          <h3>Supplier Details:</h3>
          <table className="party-table">
            <tbody>
              <tr>
                <td>Name</td>
                <td>:</td>
                <td>{purchase.seller_name}</td>
              </tr>
              {purchase.seller_gst && (
                <tr>
                  <td>GSTIN</td>
                  <td>:</td>
                  <td>{purchase.seller_gst}</td>
                </tr>
              )}
              <tr>
                <td>Driver Name</td>
                <td>:</td>
                <td>{purchase.driver_name}</td>
              </tr>
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
            <td>{purchase.grain_name}</td>
            <td className="center">1001</td>
            <td className="right">{purchase.total_weight ? `${purchase.total_weight.toFixed(1)} kg` : '-'}</td>
            <td className="right">{formatCurrency(purchase.rate_per_kg || 0)}</td>
            <td className="right">{formatCurrency(purchase.total_amount)}</td>
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
            <td className="right bold">{formatCurrency(purchase.total_amount)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Additional Info */}
      <div className="additional-info">
        <table className="info-table">
          <tbody>
            <tr>
              <td>Number of Bags</td>
              <td>:</td>
              <td>{purchase.number_of_bags}</td>
            </tr>
            <tr>
              <td>Payment Status</td>
              <td>:</td>
              <td>{purchase.payment_status.toUpperCase()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="signature">
          <p>For, BADRI PRASAD MAHESH PRASAD NAGARIYA</p>
          <div className="signature-space"></div>
          <p>Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
};