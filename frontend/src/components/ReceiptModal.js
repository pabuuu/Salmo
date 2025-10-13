import React from "react";
import Notification from "./Notification";

export default function ReceiptModal({ show, receiptUrl, onClose }) {
  if (!show || !receiptUrl) return null;

  const handlePrint = () => {
    const printWindow = window.open(receiptUrl, "_blank");
    printWindow?.print();
  };

  return (
    <Notification
      message={
        <div
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            paddingRight: "0.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h5 className="mb-3">Receipt</h5>
          <img
            src={receiptUrl}
            alt="Receipt"
            style={{
              width: "100%",
              maxHeight: "50vh",
              objectFit: "contain",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}
          />
        </div>
      }
      actions={[
        {
          label: "Print",
          onClick: handlePrint,
        },
        {
          label: "Close",
          onClick: onClose,
        },
      ]}
    />
  );
}
