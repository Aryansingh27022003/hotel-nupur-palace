document.getElementById("contactForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const status = document.getElementById("contactStatus");

  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  // 🔐 Basic validation
  if (!email || !message) {
    status.innerText = "Please fill in all fields.";
    status.style.color = "red";
    return;
  }

  status.innerText = "Sending message...";
  status.style.color = "black";

  try {
    const res = await fetch(
      "https://hotel-nupur-backend.onrender.com/api/contact/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, message })
      }
    );

    if (!res.ok) {
      throw new Error("Server responded with error");
    }

    status.innerText = "Thank you! Your message has been sent.";
    status.style.color = "green";
    document.getElementById("contactForm").reset();

  } catch (err) {
    console.error("Contact form error:", err);
    status.innerText =
      "Unable to send message right now. Please try again later.";
    status.style.color = "red";
  }
});
