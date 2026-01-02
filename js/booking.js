/* =========================================================
   booking.js — ONE GO SUBMIT (RELATION KEPT)
   ========================================================= */

let bookingId = null;
let payableAmount = 0;

/* ================= ROOM DATA ================= */
const roomType = localStorage.getItem("roomType");
const guestSection = document.getElementById("guestSection");

// Hide guest selection for Dormitory

const basePrice = parseInt(localStorage.getItem("basePrice"), 10);

if (!roomType || isNaN(basePrice)) {
  alert("Room selection missing. Please select a room again.");
  window.location.href = "rooms.html";
}


/* ================= ELEMENTS ================= */
const roomInfo = document.getElementById("roomInfo");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const bookerId = document.getElementById("bookerId");
const emailInput = document.getElementById("email");
const fromPlaceInput = document.getElementById("fromPlace");
const purposeInput = document.getElementById("purpose");

const checkInInput = document.getElementById("checkIn");
const checkOutInput = document.getElementById("checkOut");

const guestsInput = document.getElementById("guests");
const guestDetailsDiv = document.getElementById("guestDetails");
const totalAmountText = document.getElementById("totalAmount");

const phoneInput = document.getElementById("phone");
const whatsappInput = document.getElementById("whatsapp");
const sameAsMobile = document.getElementById("sameAsMobile");

const refundUpiInput = document.getElementById("refundUpi");
const refundPhoneInput = document.getElementById("refundPhone");

const paymentSection = document.getElementById("paymentInstructions");
const qrImg = document.getElementById("upiQr");
const payAmountSpan = document.getElementById("payAmount");
const upiText = document.getElementById("upiText");

const createBookingBtn = document.getElementById("createBookingBtn"); // KEPT (unused)
const finalSubmitBtn = document.getElementById("finalSubmitBtn");
const paymentProofInput = document.getElementById("paymentProof");

/* ================= UI ================= */
roomInfo.innerText = `Room Selected: ${roomType} | ₹${basePrice} / night`;
paymentSection.style.display = "block";

/* ================= DATE RULES ================= */
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
checkInInput.min = tomorrow.toISOString().split("T")[0];

checkInInput.addEventListener("change", () => {
  const d = new Date(checkInInput.value);
  d.setDate(d.getDate() + 1);
  checkOutInput.min = d.toISOString().split("T")[0];
  calculateTotal();
});

checkOutInput.addEventListener("change", calculateTotal);

/* ================= WHATSAPP SAME AS MOBILE ================= */
sameAsMobile.addEventListener("change", () => {
  if (sameAsMobile.checked) {
    if (phoneInput.value.length !== 10) {
      alert("Enter valid mobile number first");
      sameAsMobile.checked = false;
      return;
    }
    whatsappInput.value = phoneInput.value;
    whatsappInput.readOnly = true;
  } else {
    whatsappInput.value = "";
    whatsappInput.readOnly = false;
  }
});

if (roomType === "Dormitory" && guestSection) {
  guestSection.style.display = "none";
  guestsInput.value = "0";
}


/* ================= GUEST DETAILS (RELATION LIST KEPT) ================= */
guestsInput.addEventListener("change", () => {
  guestDetailsDiv.innerHTML = "";
  const count = parseInt(guestsInput.value || "0", 10);

  for (let i = 1; i <= count; i++) {
    guestDetailsDiv.innerHTML += `
      <div style="margin-top:15px">
        <h4>Guest ${i}</h4>

        <input name="guest_name_${i}" placeholder="Guest Name" required>
        <input name="guest_age_${i}" type="number" min="1" placeholder="Age" required>

        <select name="guest_relation_${i}" required>
          <option value="">Select Relation</option>
          <option>Father</option>
          <option>Mother</option>
          <option>Son</option>
          <option>Daughter</option>
          <option>Brother</option>
          <option>Sister</option>
          <option>Husband</option>
          <option>Wife</option>
          <option>Uncle</option>
          <option>Aunt</option>
          <option>Cousin</option>
          <option>Friend</option>
          <option>Colleague</option>
          <option>Guardian</option>
          <option>Other</option>
        </select>

        <label>ID Proof</label>
        <input type="file" name="guest_id_${i}" accept=".jpg,.jpeg,.png,.pdf" required>
      </div>
    `;
  }

  calculateTotal();
});

/* ================= VALIDATION ================= */
function validatePrimaryForm() {
  if (!nameInput.value.trim()) return alert("Enter full name"), false;
  if (!ageInput.value || ageInput.value < 1) return alert("Enter valid age"), false;
  if (!/^\d{10}$/.test(phoneInput.value)) return alert("Enter valid mobile"), false;
  if (!emailInput.value.includes("@")) return alert("Enter valid email"), false;
  if (!checkInInput.value || !checkOutInput.value) return alert("Select dates"), false;
  if (!fromPlaceInput.value.trim()) return alert("Enter coming from"), false;
  if (!purposeInput.value.trim()) return alert("Enter purpose"), false;
  if (!bookerId.files[0]) return alert("Primary ID required"), false;
  if (!refundUpiInput.value && !refundPhoneInput.value)
    return alert("Refund details required"), false;
  if (!paymentProofInput.files[0])
    return alert("Upload payment proof"), false;
  return true;
}

/* ================= TOTAL ================= */
function calculateTotal() {
  if (!checkInInput.value || !checkOutInput.value) return;

  const nights =
    (new Date(checkOutInput.value) - new Date(checkInInput.value)) /
    (1000 * 60 * 60 * 24);

  const guestCount = parseInt(guestsInput.value || "0", 10);
  payableAmount = (basePrice + guestCount * 200) * nights;

  totalAmountText.innerText =
    `Total Payable: ₹${payableAmount} (${nights} nights, ${guestCount} guests)`;

  const upiId = "aryansingh27022003@oksbi";
  upiText.innerText = upiId;
  payAmountSpan.innerText = payableAmount;

  const upiUrl =
    `upi://pay?pa=${upiId}&pn=Hotel%20Nupur%20Palace&am=${payableAmount}&cu=INR`;

  qrImg.src =
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
}

/* =========================================================
   ONE BUTTON — CREATE + UPLOAD
   ========================================================= */
finalSubmitBtn.onclick = async () => {
  if (finalSubmitBtn.disabled) return;
  if (!validatePrimaryForm()) return;

  finalSubmitBtn.disabled = true;
  finalSubmitBtn.innerText = "Submitting...";

  try {
    const fd = new FormData();

    fd.append("name", nameInput.value.trim());
    fd.append("age", ageInput.value);
    fd.append("phone", phoneInput.value);
    fd.append("whatsapp", whatsappInput.value);
    fd.append("email", emailInput.value);
    fd.append("roomType", roomType);
    fd.append("checkIn", checkInInput.value);
    fd.append("checkOut", checkOutInput.value);
    fd.append("fromPlace", fromPlaceInput.value);
    fd.append("purpose", purposeInput.value);
    fd.append("guests", guestsInput.value);
    fd.append("amount", payableAmount);
    fd.append("bookerId", bookerId.files[0]);

    if (refundUpiInput.value) {
      fd.append("refundMode", "UPI");
      fd.append("refundValue", refundUpiInput.value);
    } else {
      fd.append("refundMode", "PHONE");
      fd.append("refundValue", refundPhoneInput.value);
    }

    const guestCount = parseInt(guestsInput.value || "0", 10);
    for (let i = 1; i <= guestCount; i++) {
      fd.append(`guest_name_${i}`, document.querySelector(`[name="guest_name_${i}"]`).value);
      fd.append(`guest_age_${i}`, document.querySelector(`[name="guest_age_${i}"]`).value);
      fd.append(`guest_relation_${i}`, document.querySelector(`[name="guest_relation_${i}"]`).value);
      fd.append(`guest_id_${i}`, document.querySelector(`[name="guest_id_${i}"]`).files[0]);
    }

    const createRes = await fetch(
      "https://hotel-nupur-palace.onrender.com/api/booking/create-pending",
      { method: "POST", body: fd }
    );

    const data = await createRes.json();
    bookingId = data.bookingId;

    const pf = new FormData();
    pf.append("paymentProof", paymentProofInput.files[0]);

    await fetch(
      `https://hotel-nupur-palace.onrender.com/api/booking/upload-payment-proof/${bookingId}`,
      { method: "POST", body: pf }
    );

    window.location.href =
      `/hotel-nupur-palace/receipt.html?bookingId=${bookingId}`;

  } catch {
    finalSubmitBtn.disabled = false;
    finalSubmitBtn.innerText = "Upload Payment Proof";
    alert("Submission failed");
  }
};
