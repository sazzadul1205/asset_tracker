import React from 'react';

const View_Department_Modal = ({
  selectedDepartment,
  setSelectedDepartment,
}) => {

  // Close Modal
  const handleClose = () => {
    setSelectedUser(null);
    document.getElementById("View_User_Modal")?.close();
  }


  return (
    <div
      id="View_User_Modal"
      className="modal-box w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >

    </div>
  );
};

export default View_Department_Modal;