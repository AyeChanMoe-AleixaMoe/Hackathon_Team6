function togglePayment() {
  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;

  if (!name || !date || !time) {
    alert("Please fill in all booking details.");
    return;
  }

  document.getElementById('payment-section').classList.remove('hidden');
}

function submitPayment() {
  const cardNumber = document.getElementById('card-number').value.trim();
  if (!cardNumber) {
    alert("Please enter your card number.");
    return;
  }
  
  window.location.href = 'confirmation.html';
}

