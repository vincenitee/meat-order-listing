import { generateTimestamp } from "./dateUtils.js";

export function exportToPDF(orders) {
    const { jsPDF } = window.jspdf;
    // Initialize jsPDF in landscape orientation
    const doc = new jsPDF("landscape");

    // Set custom font for compatibility
    doc.setFont("helvetica");

    // Add a title
    const title = "Order Summary Report";
    doc.setFontSize(18);
    doc.setTextColor("#000000");
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

    // Add Date Range or Generated Timestamp
    const generatedOn = `Generated on: ${new Date().toLocaleString()}`;
    doc.setFontSize(10);
    doc.setTextColor("#555555");
    doc.text(generatedOn, 10, 30);

    // Prepare Table Data
    const tableData = orders.map(order => [
        order.customerName,
        order.selectedParts.join(", "), // Convert array to string
        `${order.quantity} kg`,
        `P${order.totalPrice.toLocaleString()}`, // Peso sign fix
        `P${order.payment.toLocaleString()}`,
        `P${order.balance.toLocaleString()}`,
        order.status,
        order.location,
        order.orderDate
    ]);

    // Add Table with Auto Column Widths
    doc.autoTable({
        head: [
            [
                "Customer",
                "Ordered Parts",
                "Quantity (kg)",
                "Total Price",
                "Payment",
                "Balance",
                "Status",
                "Location",
                "Date Ordered"
            ]
        ],
        body: tableData,
        startY: 40, // Start below the title
        theme: "grid", // Styling theme
        headStyles: {
            fillColor: [22, 160, 133], // Header background color
            textColor: [255, 255, 255], // Header text color
            fontSize: 10,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0],
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240], // Light gray alternating row color
        },
        styles: {
            overflow: "linebreak", // Ensure long text wraps within the cell
            cellPadding: 5,
        },
        columnStyles: {
            0: { halign: "left" }, // Align customer name to the left
            2: { halign: "right" }, // Align quantity to the right
            3: { halign: "center" }, // Align total price to the right
            4: { halign: "center" }, // Align payment to the right
            5: { halign: "center" }, // Align balance to the right
            6: { halign: "center" }, // Align status to the center
        },
    });

    // Add Footer with Page Numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(10);
        doc.setTextColor("#555555");
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: "right" });
    }

    // Save the PDF with Timestamp
    const timestamp = generateTimestamp();
    doc.save(`orders_${timestamp}.pdf`);
}
