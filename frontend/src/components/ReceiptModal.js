import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ReceiptModal({ show, onClose, receiptUrl }) {
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Receipt</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <img
          src={receiptUrl}
          alt="Receipt"
          className="img-fluid"
          style={{ maxHeight: "500px" }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
