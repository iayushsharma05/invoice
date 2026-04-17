import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import InvoiceForm from "./components/InvoiceForm";
import InvoiceDashboard from "./components/Dashboard";
import InvoiceList from "./components/InvoiceList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InvoiceForm />} />
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/analytics" element={<InvoiceDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;