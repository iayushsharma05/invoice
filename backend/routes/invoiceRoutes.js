const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");


// ✅ CREATE INVOICE
router.post("/", async (req, res) => {
  try {
    const newInvoice = new Invoice({
      invoiceNumber: req.body.invoiceNumber,
      date: new Date(),

      customer: {
        name: req.body.customer?.name,
        email: req.body.customer?.email,
        address: req.body.customer?.address,
      },

      seller: {
        name: req.body.seller?.name,
        email: req.body.seller?.email,
        address: req.body.seller?.address,
      },

      items: req.body.items || [],
      dateOfIssue: req.body.dateOfIssue,
      dueDate: req.body.dueDate,
      paymentTerms: req.body.paymentTerms,
      notes: req.body.notes,

      subTotal: req.body.subTotal,
      taxRate: req.body.taxRate,
      taxAmount: req.body.taxAmount,
      discount: req.body.discount,
      extraCharges: req.body.extraCharges,
      total: req.body.total,
    });

    await newInvoice.save();

    res.status(201).json({
      success: true,
      message: "✅ Invoice saved successfully",
      data: newInvoice,
    });

  } catch (err) {
    console.error("❌ Save Error:", err);
    res.status(500).json({
      success: false,
      message: "❌ Error saving invoice",
      error: err.message,
    });
  }
});


// ✅ GET ALL INVOICES
router.get("/all", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ date: -1 });

    res.json({
      success: true,
      count: invoices.length,
      data: invoices,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "❌ Error fetching invoices",
    });
  }
});


// ✅ GET SINGLE INVOICE (VIEW DETAILS)
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({
      success: true,
      data: invoice,
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching invoice" });
  }
});


// ✅ DELETE INVOICE (OPTIONAL 🔥)
router.delete("/:id", async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "🗑 Invoice deleted",
    });

  } catch (err) {
    res.status(500).json({ message: "Error deleting invoice" });
  }
});


// ✅ UPDATE INVOICE (OPTIONAL 🔥)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;