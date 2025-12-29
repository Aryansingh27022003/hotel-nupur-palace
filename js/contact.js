document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    const status = document.getElementById("contactStatus");

    const res = await fetch("https://hotel-nupur-backend.onrender.com/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message })
    });

    if (res.ok) {
        status.innerText = "Thank you! Your message has been sent.";
        status.style.color = "green";
        document.getElementById("contactForm").reset();
    } else {
        status.innerText = "Failed to send message. Please try again.";
        status.style.color = "red";
    }
});
