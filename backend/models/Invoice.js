const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: Number,
  date: Date,

  customer: {
    name: String,
    email: String,
    address: String,
  },

  seller: {
    name: String,
    email: String,
    address: String,
  },

  dateOfIssue: String,
  dueDate: String,
  paymentTerms: String,
  notes: String,

  items: [
    {
      name: String,
      description: String,
      price: Number,
      quantity: Number,
    }
  ],

  subTotal: Number,
  taxRate: Number,
  taxAmount: Number,
  discount: Number,
  extraCharges: Number,
  total: Number,
});

module.exports = mongoose.model("Invoice", invoiceSchema);