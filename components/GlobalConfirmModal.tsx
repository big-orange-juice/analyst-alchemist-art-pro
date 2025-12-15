'use client';

import ConfirmModal from '@/components/ConfirmModal';
import { useModalStore } from '@/store';

export default function GlobalConfirmModal() {
  const { confirmModal, setConfirmModal } = useModalStore();

  return (
    <ConfirmModal
      isOpen={confirmModal.isOpen}
      title={confirmModal.title}
      message={confirmModal.message}
      onConfirm={() => {
        try {
          confirmModal.action();
        } finally {
          setConfirmModal({
            isOpen: false,
            title: '',
            message: '',
            action: () => {}
          });
        }
      }}
      onCancel={() =>
        setConfirmModal({
          isOpen: false,
          title: '',
          message: '',
          action: () => {}
        })
      }
    />
  );
}
