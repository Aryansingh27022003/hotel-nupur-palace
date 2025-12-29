function bookRoom(room, price) {
    localStorage.setItem("roomType", room);
    localStorage.setItem("basePrice", price); // ✅ correct key
    window.location.href = "booking.html";
}


/* HERO BACKGROUND (SINGLE IMAGE) */
const hero = document.querySelector(".hero");

if (hero) {
    hero.style.backgroundImage = "url('assets/hero/hero0.png')";
}
