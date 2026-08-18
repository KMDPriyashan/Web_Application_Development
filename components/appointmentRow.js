function AppointmentRow(appointment) {
  return `
    <tr>
      <td>${appointment.id}</td>
      <td>${appointment.patient}</td>
      <td>${appointment.reason}</td>
    </tr>
  `;
}

module.exports = AppointmentRow;