import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";

const CustomNavbar = () => {
  return (
    <Navbar
      expand="lg"
      className="shadow-sm sticky-top"
      style={{
        background: "linear-gradient(135deg, #4facfe, #00f2fe)",
      }}
    >
      <Container>
        {/* Logo / Title */}
        <Navbar.Brand
          href="/"
          className="fw-bold text-white"
          style={{ fontSize: "1.3rem" }}
        >
          💼 Invoice Generator
        </Navbar.Brand>

        <Navbar.Toggle />

        <Navbar.Collapse className="justify-content-end">
          <Nav className="align-items-center gap-3">

            <Button
              variant="dark"
              onClick={() => (window.location.href = "/")}
              className="fw-semibold px-3"
              style={{
                borderRadius: "5px",
              }}
            >
              📄 Generate Invoices
            </Button>

            {/* Saved Invoice Button */}
            <Button
              variant="light"
              onClick={() => (window.location.href = "/invoices")}
              className="fw-semibold px-3"
              style={{
                borderRadius: "20px",
              }}
            >
              📄 Saved Invoices
            </Button>

            <Button
              variant="dark"
              onClick={() => (window.location.href = "/analytics")}
              className="fw-semibold px-3"
              style={{
                borderRadius: "5px",
              }}
            >
              📊 Analytics Dashboard
            </Button>


          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;