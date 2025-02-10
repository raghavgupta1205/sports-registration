package com.anpl.service;

import com.anpl.model.Payment;
import com.anpl.model.User;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {
    
    public byte[] generatePaymentReceipt(Payment payment) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            User user = payment.getRegistration().getUser();

            // Add header
            document.add(new Paragraph("ANPL Payment Receipt")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(20));

            // Add payment details
            Table table = new Table(2);
            table.addCell("Receipt Number");
            table.addCell(payment.getId().toString());
            table.addCell("Payment Date");
            table.addCell(payment.getPaymentDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            table.addCell("Name");
            table.addCell(user.getFullName());
            table.addCell("Registration Number");
            table.addCell(user.getRegistrationNumber());
            table.addCell("Amount Paid");
            table.addCell("₹" + payment.getAmount());
            table.addCell("Payment Status");
            table.addCell(payment.getPaymentStatus().toString());
            table.addCell("Transaction ID");
            table.addCell(payment.getRazorpayPaymentId());

            document.add(table);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF receipt", e);
        }
    }
} 