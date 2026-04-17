const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { jsPDF } = require("jspdf");

// Function to generate PDF from invoice data
const generateInvoicePDF = (invoiceData) => {
  const pdf = new jsPDF();
  
  // Header
  pdf.setFontSize(20);
  pdf.text(`Invoice #${invoiceData.invoiceNumber}`, 20, 30);
  
  // Customer details
  pdf.setFontSize(12);
  pdf.text(`Customer: ${invoiceData.customer?.name || ''}`, 20, 50);
  pdf.text(`Email: ${invoiceData.customer?.email || ''}`, 20, 60);
  pdf.text(`Address: ${invoiceData.customer?.address || ''}`, 20, 70);
  pdf.text(`Issue Date: ${invoiceData.dateOfIssue || ''}`, 20, 80);
  pdf.text(`Due Date: ${invoiceData.dueDate || ''}`, 20, 90);
  
  // Items table
  pdf.text('Items:', 20, 105);
  let yPos = 115;
  pdf.text('Name', 20, yPos);
  pdf.text('Qty', 100, yPos);
  pdf.text('Price', 130, yPos);
  pdf.text('Total', 160, yPos);
  
  yPos += 10;
  invoiceData.items.forEach(item => {
    pdf.text(item.name || '', 20, yPos);
    pdf.text(item.quantity?.toString() || '0', 100, yPos);
    pdf.text(`₹${item.price || 0}`, 130, yPos);
    pdf.text(`₹${(item.price || 0) * (item.quantity || 0)}`, 160, yPos);
    yPos += 10;
  });
  
  // Totals
  yPos += 10;
  pdf.text(`Subtotal: ₹${invoiceData.subTotal || 0}`, 20, yPos);
  yPos += 10;
  pdf.text(`Tax: ₹${invoiceData.taxAmount || 0}`, 20, yPos);
  yPos += 10;
  pdf.text(`Discount: ₹${invoiceData.discount || 0}`, 20, yPos);
  yPos += 10;
  pdf.text(`Extra Charges: ₹${invoiceData.extraCharges || 0}`, 20, yPos);
  yPos += 10;
  pdf.text(`Total: ₹${invoiceData.total || 0}`, 20, yPos);
  
  const arrayBuffer = pdf.output('arraybuffer');
  return Buffer.from(arrayBuffer);
};

// Function to send invoice email
const sendInvoiceEmail = async (toEmail, invoiceData) => {
  try {
    // Check if email config is set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email configuration not set. Please set EMAIL_USER and EMAIL_PASS in .env file.");
    }

    const pdfBuffer = generateInvoicePDF(invoiceData);
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Your Invoice" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Invoice #${invoiceData.invoiceNumber} - Payment Details`,
      
      // Professional HTML Email
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f6f8;">
          
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <h2 style="color: #2c3e50; margin-bottom: 10px;">
              🧾 Invoice Generated
            </h2>

            <p style="color: #555;">
              Hello <strong>${invoiceData.customer?.name || "Customer"}</strong>,
            </p>

            <p style="color: #555;">
              Thank you for your business. Your invoice has been generated successfully.
              Please find the details below:
            </p>

            <hr style="margin: 20px 0;" />

            <table style="width: 100%; font-size: 14px; color: #333;">
              <tr>
                <td><strong>Invoice Number:</strong></td>
                <td>${invoiceData.invoiceNumber}</td>
              </tr>
              <tr>
                <td><strong>Total Amount:</strong></td>
                <td>₹ ${invoiceData.total}</td>
              </tr>
              <tr>
                <td><strong>Date:</strong></td>
                <td>${new Date().toLocaleDateString()}</td>
              </tr>
            </table>

            <hr style="margin: 20px 0;" />

            <p style="color: #555;">
              📎 The invoice PDF is attached with this email.
            </p>

            <p style="color: #555;">
              If you have any questions, feel free to contact us.
            </p>

            <br />

            <p style="color: #2c3e50; font-weight: bold;">
              Regards,<br/>
              Your Company Name
            </p>

          </div>

          <p style="text-align: center; font-size: 12px; color: #999; margin-top: 15px;">
            This is an automated email. Please do not reply.
          </p>

        </div>
      `,

      attachments: [
        {
          filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent");
  } catch (err) {
    console.log("❌ Email Error:", err);
    throw err;
  }
};

router.post("/send-invoice-email", async (req, res) => {
  const { email, invoice } = req.body;

  try {
    await sendInvoiceEmail(email, invoice);
    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;