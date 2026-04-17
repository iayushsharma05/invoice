import React, { useEffect, useState } from "react";
import { Table, Container, Button, Modal, Form, Spinner } from "react-bootstrap";
import CustomNavbar from "./Navbar";
import jsPDF from "jspdf";

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editInvoice, setEditInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // for buttons

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/invoices/all");
      if (!res.ok) {
        throw new Error(`Failed to load invoices (${res.status})`);
      }

      const data = await res.json();
      const invoicesData = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setInvoices(invoicesData);

      if (!invoicesData.length) {
        console.warn("Invoice list loaded empty:", data);
      }
    } catch (err) {
      console.error("Fetch invoices error:", err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;

    setActionLoading(id);
    await fetch(`http://localhost:5000/api/invoices/${id}`, {
      method: "DELETE",
    });

    setInvoices(prev => prev.filter(inv => inv._id !== id));
    setActionLoading(null);
  };

  // 🔥 UPDATE
  const handleUpdate = async () => {
    setLoading(true);

    await fetch(`http://localhost:5000/api/invoices/${editInvoice._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editInvoice),
    });

    alert("✅ Updated");
    setEditInvoice(null);
    fetchInvoices();
  };

  // 🔥 PDF
  const downloadPDF = (inv) => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text(`Invoice #${inv.invoiceNumber}`, 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Issue Date: ${inv.dateOfIssue || "-"}`, 20, 35);
    pdf.text(`Due Date: ${inv.dueDate || "-"}`, 20, 45);
    pdf.text(`Customer: ${inv.customer?.name}`, 20, 60);
    pdf.text(`Email: ${inv.customer?.email}`, 20, 70);
    pdf.text(`Total: ₹ ${inv.total}`, 20, 85);

    let y = 105;
    pdf.text("Item", 20, y);
    pdf.text("Description", 70, y);
    pdf.text("Qty", 140, y);
    pdf.text("Price", 170, y);
    pdf.text("Amount", 210, y);
    y += 10;

    inv.items?.forEach(item => {
      pdf.text(item.name || "", 20, y);
      pdf.text(item.description || "", 70, y);
      pdf.text(String(item.quantity || 0), 140, y);
      pdf.text(`₹${item.price || 0}`, 170, y);
      pdf.text(`₹${(item.price || 0) * (item.quantity || 0)}`, 210, y);
      y += 10;
    });

    y += 10;
    pdf.text(`Subtotal: ₹${inv.subTotal || 0}`, 20, y);
    y += 10;
    pdf.text(`Tax: ₹${(inv.subTotal * (inv.taxRate || 0) / 100).toFixed(2)}`, 20, y);
    y += 10;
    pdf.text(`Discount: ₹${inv.discount || 0}`, 20, y);
    y += 10;
    pdf.text(`Extra Charges: ₹${inv.extraCharges || 0}`, 20, y);
    y += 10;
    pdf.setFontSize(14);
    pdf.text(`Total: ₹ ${inv.total || 0}`, 20, y);
    pdf.save(`invoice-${inv.invoiceNumber}.pdf`);
  };

  // ✅ SEND MAIL
const sendEmail = async (inv) => {
  try {
    setActionLoading(inv._id);

    const res = await fetch("http://localhost:5000/api/email/send-invoice-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: inv.customer?.email,
        invoice: inv
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Email failed");
    }

    alert("✅ Email Sent Successfully!");
  } catch (err) {
    console.error(err);
    alert("❌ Email Failed");
  } finally {
    setActionLoading(null);
  }
};

  // 🔍 FILTER
  const filteredInvoices = (invoices || []).filter(inv => {
    const query = search.toLowerCase();
    return (
      inv.customer?.name?.toLowerCase().includes(query) ||
      inv.customer?.email?.toLowerCase().includes(query) ||
      String(inv.invoiceNumber).includes(query)
    );
  });

  return (
    <>
      <CustomNavbar />

      <Container className="mt-4">

        {/* SEARCH */}
        <Form.Control
          placeholder="Search invoice number, customer name, or email..."
          className="mb-3"
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* LOADING */}
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : filteredInvoices.length ? (
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((inv, i) => {
                return (
                  <tr key={inv._id}>
                    <td>{i + 1}</td>
                    <td>{inv.invoiceNumber}</td>
                    <td>{inv.customer?.name}</td>
                    <td>{inv.customer?.email}</td>
                    <td>{inv.dateOfIssue || "-"}</td>
                    <td>{inv.dueDate || "-"}</td>
                    <td>₹ {inv.total}</td>

                    <td className="d-flex gap-2">
                      <Button size="sm" onClick={() => setSelectedInvoice(inv)}>👁</Button>

                      <Button size="sm" variant="warning" onClick={() => setEditInvoice(inv)}>
                        ✏️
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(inv._id)}
                      >
                        {actionLoading === inv._id ? <Spinner size="sm" /> : "🗑"}
                      </Button>

                      <Button size="sm" variant="success" onClick={() => downloadPDF(inv)}>
                        📥
                      </Button>

                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => sendEmail(inv)}
                      >
                        {actionLoading === inv._id ? <Spinner size="sm" /> : "📧"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-5 text-muted">
            No invoices found. Make sure the backend is running and the API is returning invoice data.
          </div>
        )}
      </Container>

      {/* VIEW */}
      <Modal show={!!selectedInvoice} onHide={() => setSelectedInvoice(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Invoice #{selectedInvoice?.invoiceNumber}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p><strong>Invoice #:</strong> {selectedInvoice?.invoiceNumber}</p>
          <p><strong>Issue Date:</strong> {selectedInvoice?.dateOfIssue || "-"}</p>
          <p><strong>Due Date:</strong> {selectedInvoice?.dueDate || "-"}</p>
          <p><strong>Customer:</strong> {selectedInvoice?.customer?.name}</p>
          <p><strong>Customer Email:</strong> {selectedInvoice?.customer?.email}</p>
          <p><strong>Customer Address:</strong> {selectedInvoice?.customer?.address || "-"}</p>
          <p><strong>Seller:</strong> {selectedInvoice?.seller?.name}</p>
          <p><strong>Seller Email:</strong> {selectedInvoice?.seller?.email}</p>
          <p><strong>Seller Address:</strong> {selectedInvoice?.seller?.address || "-"}</p>
          <p><strong>Payment Terms:</strong> {selectedInvoice?.paymentTerms || "-"}</p>
          <p><strong>Notes:</strong> {selectedInvoice?.notes || "-"}</p>
          <p><strong>Tax:</strong> ₹ {(selectedInvoice?.subTotal * (selectedInvoice?.taxRate || 0)) / 100}</p>
          <p><strong>Discount:</strong> ₹ {selectedInvoice?.discount}</p>
          <p><strong>Extra Charges:</strong> ₹ {selectedInvoice?.extraCharges || 0}</p>
          <p><strong>Total:</strong> ₹ {selectedInvoice?.total}</p>
        </Modal.Body>
      </Modal>

      {/* EDIT */}
      <Modal show={!!editInvoice} onHide={() => setEditInvoice(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Invoice</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {editInvoice && (
            <>
                <h5>Seller</h5>

              <Form.Control
                className="mb-2"
                placeholder="Seller Name"
                value={editInvoice.seller?.name}
                onChange={(e) =>
                  setEditInvoice({
                    ...editInvoice,
                    seller: { ...editInvoice.seller, name: e.target.value }
                  })
                }
              />

              <Form.Control
                className="mb-2"
                placeholder="Seller Email"
                value={editInvoice.seller?.email}
                onChange={(e) =>
                  setEditInvoice({
                    ...editInvoice,
                    seller: { ...editInvoice.seller, email: e.target.value }
                  })
                }
              />

              <Form.Control
                className="mb-2"
                placeholder="Seller Address"
                value={editInvoice.seller?.address}
                onChange={(e) =>
                  setEditInvoice({
                    ...editInvoice,
                    seller: { ...editInvoice.seller, address: e.target.value }
                  })
                }
              />

              <h5 className="mt-3">Customer</h5>

              <Form.Control
                className="mb-2"
                placeholder="Customer Name"
                value={editInvoice.customer?.name}
                onChange={(e) =>
                  setEditInvoice({
                    ...editInvoice,
                    customer: { ...editInvoice.customer, name: e.target.value }
                  })
                }
              />

              <Form.Control
                className="mb-2"
                placeholder="Customer Email"
                value={editInvoice.customer?.email}
                onChange={(e) =>
                  setEditInvoice({
                    ...editInvoice,
                    customer: { ...editInvoice.customer, email: e.target.value }
                  })
                }
              />

              <Form.Control
                className="mb-2"
                placeholder="Customer Address"
                value={editInvoice.customer?.address}
                onChange={(e) =>
                  setEditInvoice({
                    ...editInvoice,
                    customer: { ...editInvoice.customer, address: e.target.value }
                  })
                }
              />

              <h5 className="mt-3">Invoice Details</h5>

              <Form.Control
                className="mb-2"
                type="date"
                placeholder="Issue Date"
                value={editInvoice.dateOfIssue || ""}
                onChange={(e) =>
                  setEditInvoice({ ...editInvoice, dateOfIssue: e.target.value })
                }
              />

              <Form.Control
                className="mb-2"
                type="date"
                placeholder="Due Date"
                value={editInvoice.dueDate || ""}
                onChange={(e) =>
                  setEditInvoice({ ...editInvoice, dueDate: e.target.value })
                }
              />

              <Form.Control
                className="mb-2"
                placeholder="Payment Terms"
                value={editInvoice.paymentTerms || ""}
                onChange={(e) =>
                  setEditInvoice({ ...editInvoice, paymentTerms: e.target.value })
                }
              />

              <Form.Control
                className="mb-2"
                placeholder="Notes"
                value={editInvoice.notes || ""}
                onChange={(e) =>
                  setEditInvoice({ ...editInvoice, notes: e.target.value })
                }
              />

              <h5 className="mt-3">Amounts</h5>

              <Form.Control
                className="mb-2"
                placeholder="Tax %"
                value={editInvoice.taxRate}
                onChange={(e) =>
                  setEditInvoice({ ...editInvoice, taxRate: e.target.value })
                }
              />

              <Form.Control
                className="mb-2"
                placeholder="Discount"
                value={editInvoice.discount}
                onChange={(e) =>
                  setEditInvoice({ ...editInvoice, discount: e.target.value })
                }
              />

              <Form.Control
                className="mb-2"
                placeholder="Extra Charges"
                value={editInvoice.extraCharges}
                onChange={(e) =>
                  setEditInvoice({ ...editInvoice, extraCharges: e.target.value })
                }
              />

              <Form.Control
                className="mb-2"
                placeholder="Total"
                value={editInvoice.total}
                onChange={(e) =>
                  setEditInvoice({ ...editInvoice, total: e.target.value })
                }
              />
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="success" onClick={handleUpdate}>
            {loading ? <Spinner size="sm" /> : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default InvoiceList;