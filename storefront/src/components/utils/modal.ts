export const initializeModals = () => {
  // Lấy tất cả các nút mở modal
  const modalToggles = document.querySelectorAll('[data-modal-toggle]');
  
  // Lấy tất cả các nút đóng modal
  const modalCloses = document.querySelectorAll('[data-modal-hide]');

  // Xử lý sự kiện click cho các nút mở modal
  modalToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const modalId = toggle.getAttribute('data-modal-toggle');
      const modal = document.getElementById(modalId!);
      if (modal) {
        modal.classList.remove('hidden');
      }
    });
  });

  // Xử lý sự kiện click cho các nút đóng modal
  modalCloses.forEach(close => {
    close.addEventListener('click', () => {
      const modalId = close.getAttribute('data-modal-hide');
      const modal = document.getElementById(modalId!);
      if (modal) {
        modal.classList.add('hidden');
      }
    });
  });

  // Đóng modal khi click ra ngoài
  window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}; 