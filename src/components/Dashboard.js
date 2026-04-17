import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import CustomNavbar from "./Navbar";

function InvoiceDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalInvoices: 0,
    totalTax: 0,
    totalDiscount: 0,
    totalQty: 0
  });

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/invoices/all");
      const result = await res.json();

      const invoices = result.data;
      setData(invoices);

      // 🔥 CALCULATE ANALYTICS
      let revenue = 0;
      let tax = 0;
      let discount = 0;
      let qty = 0;

      invoices.forEach(inv => {
        revenue += inv.total || 0;
        tax += inv.taxAmount || 0;
        discount += inv.discount || 0;
        qty += inv.totalQty || 0;
      });

      setStats({
        totalRevenue: revenue,
        totalInvoices: invoices.length,
        totalTax: tax,
        totalDiscount: discount,
        totalQty: qty
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <CustomNavbar />

      <Container className="mt-4">

        <h3 className="mb-4">📊 Invoice Analytics Dashboard</h3>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (

          <Row className="g-4">

            {/* TOTAL REVENUE */}
            <Col md={4}>
              <Card className="p-3 shadow border-0 rounded-4 bg-success text-white">
                <h6>Total Revenue</h6>
                <h3>₹ {stats.totalRevenue.toFixed(2)}</h3>
              </Card>
            </Col>

            {/* TOTAL INVOICES */}
            <Col md={4}>
              <Card className="p-3 shadow border-0 rounded-4 bg-primary text-white">
                <h6>Total Invoices</h6>
                <h3>{stats.totalInvoices}</h3>
              </Card>
            </Col>

            {/* TOTAL TAX */}
            <Col md={4}>
              <Card className="p-3 shadow border-0 rounded-4 bg-warning text-dark">
                <h6>Total Tax</h6>
                <h3>₹ {stats.totalTax.toFixed(2)}</h3>
              </Card>
            </Col>

            {/* TOTAL DISCOUNT */}
            <Col md={4}>
              <Card className="p-3 shadow border-0 rounded-4 bg-danger text-white">
                <h6>Total Discount</h6>
                <h3>₹ {stats.totalDiscount.toFixed(2)}</h3>
              </Card>
            </Col>


            {/* AVG INVOICE VALUE */}
            <Col md={4}>
              <Card className="p-3 shadow border-0 rounded-4 bg-info text-white">
                <h6>Avg Invoice Value</h6>
                <h3>
                  ₹ {(stats.totalRevenue / stats.totalInvoices || 0).toFixed(2)}
                </h3>
              </Card>
            </Col>

          </Row>
        )}
      </Container>
    </>
  );
}

export default InvoiceDashboard;