import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "./Notification";

export default function VerificationModal({ show, user, onClose }) {
  const [modalData, setModalData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is verified or modal should not show, clear modalData
    if (!show || !user || user.isVerified) {
      setModalData(null);
      return;
    }

    setModalData({
      type: "info",
      icon: "🪪",
      message: `Please verify your account by uploading a valid ID & resume.`,
      actions: [
        {
          label: "Proceed",
          onClick: () => {
            setModalData(null);
            onClose && onClose();
            navigate("/requirements");
          },
        },
        {
          label: "Cancel",
          onClick: () => {
            setModalData(null);
            onClose && onClose();
          },
        },
      ],
    });
  }, [show, user, onClose, navigate]);

  if (!modalData) return null;

  return (
    <Notification
      type={modalData.type}
      message={modalData.message}
      actions={modalData.actions}
      icon={modalData.icon}
      onClose={() => {
        setModalData(null);
        onClose && onClose();
      }}
    />
  );
}
