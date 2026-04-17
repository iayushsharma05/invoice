import React from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Table,
  Badge,
  Spinner
} from "react-bootstrap";
import CustomNavbar from "./Navbar";
import InvoiceModal from "./InvoiceModal";

class InvoiceForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      loading: false,
      emailLoading: false,

      invoiceNumber: Date.now(),
      dateOfIssue: new Date().toISOString().slice(0, 10),
      dueDate: "",
      paymentTerms: "Due on receipt",
      notes: "",

      billFrom: "",
      billFromEmail: "",
      billFromAddress: "",

      billTo: "",
      billToEmail: "",
      billToAddress: "",

      items: [{ id: 1, name: "", description: "", price: 1, quantity: 1 }],

      subTotal: 0,
      taxRate: 18,
      sgst: 0,
      cgst: 0,

      discount: 0,
      extraCharges: 0,

      totalQty: 0,
      total: 0
    };
  }

  componentDidMount() {
    this.calculateTotal();
  }

  handleChange = (e) => {
    this.setState(
      { [e.target.name]: e.target.value },
      this.calculateTotal
    );
  };

  calculateTotal = () => {
    let subTotal = 0;
    let totalQty = 0;

    this.state.items.forEach(item => {
      subTotal += Number(item.price) * Number(item.quantity);
      totalQty += Number(item.quantity);
    });

    const tax = (subTotal * this.state.taxRate) / 100;
    const sgst = tax / 2;
    const cgst = tax / 2;

    let total =
      subTotal +
      tax +
      Number(this.state.extraCharges || 0) -
      Number(this.state.discount || 0);

    this.setState({
      subTotal,
      sgst,
      cgst,
      totalQty,
      total
    });
  };

  // ✅ FIXED INPUT ISSUE
  handleItemChange = (e) => {
    const { id, name, value } = e.target;

    const items = this.state.items.map(item => {
      if (String(item.id) === String(id)) {
        return {
          ...item,
          [name]:
            name === "price" || name === "quantity"
              ? value === "" ? "" : Number(value)
              : value
        };
      }
      return item;
    });

    this.setState({ items }, this.calculateTotal);
  };

  addItem = () => {
    this.setState({
      items: [
        ...this.state.items,
        { id: Date.now(), name: "", description: "", price: "", quantity: "" }
      ]
    });
  };

  removeItem = (id) => {
    const items = this.state.items.filter(item => item.id !== id);
    this.setState({ items }, this.calculateTotal);
  };

  // ✅ SAVE + EMAIL + LOADER
  saveInvoice = async () => {
    try {
      this.setState({ loading: true });

      const data = {
        invoiceNumber: this.state.invoiceNumber,
        dateOfIssue: this.state.dateOfIssue,
        dueDate: this.state.dueDate,
        paymentTerms: this.state.paymentTerms,
        notes: this.state.notes,

        customer: {
          name: this.state.billTo,
          email: this.state.billToEmail,
          address: this.state.billToAddress,
        },

        seller: {
          name: this.state.billFrom,
          email: this.state.billFromEmail,
          address: this.state.billFromAddress,
        },

        items: this.state.items,
        subTotal: this.state.subTotal,
        taxRate: this.state.taxRate,
        sgst: this.state.sgst,
        cgst: this.state.cgst,
        taxAmount: this.state.sgst + this.state.cgst,
        discount: this.state.discount,
        extraCharges: this.state.extraCharges,
        totalQty: this.state.totalQty,
        total: this.state.total
      };

      // SAVE TO DB
      const res = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Save failed");

      // SEND EMAIL
      this.setState({ emailLoading: true });
      await fetch("http://localhost:5000/api/email/send-invoice-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: this.state.billToEmail,
          invoice: data
        })
      });

      alert("✅ Invoice Saved & Email Sent!");
    } catch (err) {
      console.error(err);
      alert("❌ Error");
    } finally {
      this.setState({ loading: false, emailLoading: false });
    }
  };

  render() {
    return (
      <>
        <CustomNavbar />

        <Container className="mt-4">

          {/* HEADER */}
          <Card className="p-4 mb-4 shadow-lg border-0"
            style={{ borderRadius: "20px", background: "linear-gradient(135deg, #4f46e5, #3b82f6)", color: "#fff" }}>
            <h3>🧾 Invoice Generator</h3>
            <Badge bg="light" text="dark">#{this.state.invoiceNumber}</Badge>
          </Card>

          {/* MAIN */}
          <Card className="p-4 shadow-lg border-0" style={{ borderRadius: "20px" }}>

            <Row className="mb-3 gy-3">
              <Col md={4}>
                <Form.Control
                  placeholder="Your Name / Company"
                  name="billFrom"
                  value={this.state.billFrom}
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  placeholder="Your Email"
                  name="billFromEmail"
                  value={this.state.billFromEmail}
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  placeholder="Your Address"
                  name="billFromAddress"
                  value={this.state.billFromAddress}
                  onChange={this.handleChange}
                />
              </Col>
            </Row>

            <Row className="mb-3 gy-3">
              <Col md={4}>
                <Form.Control
                  placeholder="Customer Name"
                  name="billTo"
                  value={this.state.billTo}
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  placeholder="Customer Email"
                  name="billToEmail"
                  value={this.state.billToEmail}
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  placeholder="Customer Address"
                  name="billToAddress"
                  value={this.state.billToAddress}
                  onChange={this.handleChange}
                />
              </Col>
            </Row>

            <Row className="mb-4 gy-3">
              <Col md={3}>
                <Form.Control
                  type="date"
                  name="dateOfIssue"
                  value={this.state.dateOfIssue}
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={this.state.dueDate}
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="Payment Terms"
                  name="paymentTerms"
                  value={this.state.paymentTerms}
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  placeholder="Notes"
                  name="notes"
                  value={this.state.notes}
                  onChange={this.handleChange}
                />
              </Col>
            </Row>

            {/* ITEMS */}
            <Table bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {this.state.items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <Form.Control
                        name="name"
                        id={item.id}
                        value={item.name || ""}
                        onChange={this.handleItemChange}
                      />
                    </td>
                    <td>
                      <Form.Control
                        name="description"
                        id={item.id}
                        value={item.description || ""}
                        onChange={this.handleItemChange}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        name="price"
                        id={item.id}
                        value={item.price}
                        onChange={this.handleItemChange}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        name="quantity"
                        id={item.id}
                        value={item.quantity}
                        onChange={this.handleItemChange}
                      />
                    </td>
                    <td>₹ {item.price * item.quantity}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => this.removeItem(item.id)}>
                        ❌
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Button onClick={this.addItem} className="mb-4">
              ➕ Add Item
            </Button>

            {/* TAX */}
            <Row className="mt-3 gy-3">
              <Col md={4}>
              <label>Tax :</label>
                <Form.Control
                  type="number"
                  name="taxRate"
                  value={this.state.taxRate}
                  onChange={this.handleChange}
                  placeholder="Tax %"
                />
              </Col>
              <Col md={4}>
                            <label>Discount :</label>
                <Form.Control
                  type="number"
                  name="discount"
                  value={this.state.discount}
                  onChange={this.handleChange}
                  placeholder="Discount"
                />
              </Col>
              <Col md={4}>
              <label>Extra Charges :</label>
                <Form.Control
                  type="number"
                  name="extraCharges"
                  value={this.state.extraCharges}
                  onChange={this.handleChange}
                  placeholder="Extra Charges"
                />
              </Col>
            </Row>

            {/* TOTAL */}
            <h4 className="mt-4 text-success">
              Total: ₹ {this.state.total}
            </h4>

            {/* PREVIEW */}
            <Button className="w-100 mb-2" variant="outline-primary" onClick={() => this.setState({ isOpen: true })}>
              👁 Preview Invoice
            </Button>

            {/* SAVE */}
            <Button className="w-100" onClick={this.saveInvoice} disabled={this.state.loading || this.state.emailLoading}>
              {this.state.loading ? <><Spinner size="sm" /> Saving...</> : 
               this.state.emailLoading ? <><Spinner size="sm" /> Sending Email...</> : 
               "💾 Save & Send"}
            </Button>

          </Card>
        </Container>

        <InvoiceModal
          showModal={this.state.isOpen}
          closeModal={() => this.setState({ isOpen: false })}
          info={this.state}
          items={this.state.items}
          currency="₹"
          subTotal={this.state.subTotal}
          taxAmmount={this.state.sgst + this.state.cgst}
          discountAmmount={this.state.discount}
          total={this.state.total}
        />
      </>
    );
  }
}

export default InvoiceForm;