import React, { useEffect } from 'react';
import { PurchaseOrder } from '@/types/purchase';
import { formatDate } from 'date-fns';

interface Props {
    order: PurchaseOrder;
}

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
    }).format(amount);
};

const PurchaseOrderPrintable: React.FC<Props> = ({ order }) => {


    useEffect(() => {
        if(order){
            console.log(order);
        }
    }, [order])
    


    return (
        <div className="printable-po">
            <style>{`
                .printable-po {
                    background: #fff;
                    color: #222;
                    padding: 32px;
                    width: 210mm;
                    min-height: 297mm;
                    margin: auto;
                    font-family: Arial, sans-serif;
                }
                .po-header-logo {
                    margin-bottom: 16px;
                }
                .po-header-title {
                    text-align: center;
                    margin-bottom: 0;
                }
                .po-header-info {
                    text-align: center;
                    margin-bottom: 8px;
                }
                .po-divider {
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 16px 0;
                }
                .po-flex-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 16px;
                }
                .po-flex-col {
                    flex: 1;
                }
                .po-flex-col-right {
                    flex: 1;
                    text-align: right;
                }
                .po-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 16px;
                    font-size: 14px;
                }
                .po-table th, .po-table td {
                    border: 1px solid #cbd5e1;
                    padding: 6px 8px;
                }
                .po-table th {
                    background: #f1f5f9;
                    font-weight: bold;
                }
                .po-table-striped tbody tr:nth-child(odd) {
                    background: #f9fafb;
                }
                .po-summary {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 16px;
                }
                .po-summary-box {
                    min-width: 220px;
                }
                .po-summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                .po-summary-row.total {
                    font-weight: bold;
                    font-size: 16px;
                }
                .po-details-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 16px;
                    font-size: 14px;
                }
                .po-details-table td {
                    border: 1px solid #cbd5e1;
                    padding: 6px 8px;
                }
                .po-bill-ship {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 64px;
                }
                .po-bill-ship-col {
                    max-width: 45%;
                }
                .po-footer {
                    text-align: center;
                    color: #9ca3af;
                    font-size: 12px;
                    margin-top: 32px;
                }
                .po-label-bold {
                    font-weight: bold;
                }
                .po-label-italic {
                    color: #9ca3af;
                    font-size: 12px;
                    font-style: italic;
                }
                .no-break {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
            `}</style>
            <div className="po-header-logo">
                <img width={'100%'} src="/assets/images/logo-machinery.png" alt="AAYAN Group" />
            </div>
            <div className="po-header-title">
                <h2 style={{ marginBottom: 0 }}>Purchase Order</h2>
            </div>
            <div className="po-header-info">
                <span style={{ fontSize: 14 }}>PO No: <b>{order.po_no}</b></span><br />
                <span style={{ fontSize: 14 }}>Date: <b>{order.po_date ? formatDate(order.po_date, 'dd/MM/yyyy') : ''}</b></span><br />
               
            </div>
            <hr className="po-divider" />
            {/* Vendor & Department Info */}
            <div className="po-flex-row">
                <div className="po-flex-col">
                    <div className="po-label-bold">To:</div>
                    <div>{order.vendor?.name}</div>
                    <div style={{ fontSize: 14 }}>{order.vendor?.address}</div>
                    <div style={{ fontSize: 14 }}>GSTIN: {order.vendor?.gstin}</div>
                </div>
                <div className="po-flex-col-right">
                    <div><b>Contact Info</b></div>
                    <div>{order.vendor?.contact_details?.contact_person || ''}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {order.vendor?.contact_details?.phone}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {order.vendor?.contact_details?.email}
                    </div>
                </div>
            </div>
            <hr className="po-divider" />

            {/* Items Table */}
            <table className="po-table po-table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Item</th>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((item, idx) => (
                        <tr key={item.id}>
                            <td>{idx + 1}</td>
                            <td>{item.item_name}</td>
                            <td>{item.item_code}</td>
                            <td>{item.description}</td>
                            <td>{item.quantity}</td>
                            <td><span style={{ textTransform: 'capitalize' }}>{item.unit}</span></td>
                            <td>{formatCurrency(item.unit_price, order.currency)}</td>
                            <td>{formatCurrency(item.total_price, order.currency)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Summary */}
            <div className="po-summary no-break pb-2">
                <div className="po-summary-box">
                    <div className="po-summary-row">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(order.total_amount, order.currency)}</span>
                    </div>
                    <div className="po-summary-row">
                        <span>Tax:</span>
                        <span>{formatCurrency(order.tax_amount, order.currency)}</span>
                    </div>
                    <div className="po-summary-row">
                        <span>Freight:</span>
                        <span>{formatCurrency(order.freight_amount, order.currency)}</span>
                    </div>
                    <div className="po-summary-row">
                        <span>Insurance:</span>
                        <span>{formatCurrency(order.insurance_amount, order.currency)}</span>
                    </div>
                    <hr className="po-divider" style={{ margin: '4px 0' }} />
                    <div className="po-summary-row total">
                        <span>Grand Total:</span>
                        <span>{formatCurrency(order.grand_total, order.currency)}</span>
                    </div>
                </div>
            </div>
            
            {/* Order Details */}
            <table className="po-details-table no-break">
                <tbody>
                    <tr>
                        <td width="30%"><b>Payment Terms</b></td>
                        <td>{order.payment_terms || '-'}</td>
                    </tr>
                    <tr>
                        <td><b>Delivery Terms</b></td>
                        <td>{order.delivery_terms || '-'}</td>
                    </tr>
                    <tr>
                        <td><b>Warranty Terms</b></td>
                        <td>{order.warranty_terms || '-'}</td>
                    </tr>
                    <tr>
                        <td><b>Special Instructions</b></td>
                        <td>{order.special_instructions || '-'}</td>
                    </tr>
                    <tr>
                        <td><b>Quality Requirements</b></td>
                        <td>{order.quality_requirements || '-'}</td>
                    </tr>
                    <tr>
                        <td><b>Inspection Requirements</b></td>
                        <td>{order.inspection_requirements || '-'}</td>
                    </tr>
                    <tr>
                        <td><b>Certification Requirements</b></td>
                        <td>{order.certification_requirements || '-'}</td>
                    </tr>
                    <tr>
                        <td><b>Quotation Ref</b></td>
                        <td>{order.quotation_reference || '-'}</td>
                    </tr>
                </tbody>
            </table>
            <hr className="po-divider" />
            {/* Bill To and Ship To section */}
            <div className="po-bill-ship no-break">
                <div className="po-bill-ship-col">
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Bill To</div>
                    <div style={{ fontSize: 14 }}>Aayan Machinaries</div>
                    <div className="po-label-italic">Address to be added....</div>
                </div>
                <div className="po-bill-ship-col">
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>Ship To</div>
                    <div style={{ fontSize: 14 }}>{order.delivery_location || '-'}</div>
                </div>
            </div>
            {/* Footer */}
            <hr className="po-divider" style={{ margin: '32px 0' }} />
            <div className="po-footer">
                This is a system-generated document. For queries, contact purchase@yourcompany.com
            </div>
        </div>
    );
};

export default PurchaseOrderPrintable; 