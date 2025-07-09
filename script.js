function toggleLanguage() {
    const currentLang = document.documentElement.lang;
    if (currentLang === "en") {
        document.documentElement.lang = "kn"; // Change to Kannada
        document.querySelectorAll("h2, p, a").forEach(el => {
            if (el.classList.contains('about-section-text')) {
                el.innerHTML = translateAboutToKannada(); // Use innerHTML to preserve bold tags
            } else {
                el.textContent = translateToKannada(el.textContent); // General translation for other text
            }
        });
    } else {
        document.documentElement.lang = "en"; // Change back to English
        document.querySelectorAll("h2, p, a").forEach(el => {
            if (el.classList.contains('about-section-text')) {
                el.innerHTML = translateAboutToEnglish(); // Use innerHTML to preserve bold tags
            } else {
                el.textContent = translateToEnglish(el.textContent); // General translation for other text
            }
        });
    }
}

function translateToKannada(text) {
    const translations = {
        "Welcome to Shri Varasiddhi Vinayaka Temple": "ಶ್ರೀ ವರಸಿದ್ಧಿ ವಿನಾಯಕ ದೇವಸ್ಥಾನಕ್ಕೆ ಸ್ವಾಗತ",
        "Experience the divine grace and peace at our sacred temple.": "ನಮ್ಮ ಪವಿತ್ರ ದೇವಾಲಯದಲ್ಲಿ ದೈವಿಕ ಕೃಪೆ ಮತ್ತು ಶಾಂತಿಯನ್ನು ಅನುಭವಿಸಿ.",
        "View Puja Events": "ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
        "About the Temple": "ದೇವಾಲಯದ ಬಗ್ಗೆ",
    };
    return translations[text] || text;
}

function translateToEnglish(text) {
    const translations = {
        "ಶ್ರೀ ವರಸಿದ್ಧಿ ವಿನಾಯಕ ದೇವಸ್ಥಾನಕ್ಕೆ ಸ್ವಾಗತ": "Welcome to Shri Varasiddhi Vinayaka Temple",
        "ನಮ್ಮ ಪವಿತ್ರ ದೇವಾಲಯದಲ್ಲಿ ದೈವಿಕ ಕೃಪೆ ಮತ್ತು ಶಾಂತಿಯನ್ನು ಅನುಭವಿಸಿ.": "Experience the divine grace and peace at our sacred temple.",
        "ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ": "View Puja Events",
        "ದೇವಾಲಯದ ಬಗ್ಗೆ": "About the Temple",
    };
    return translations[text] || text;
}

// Translation for the "About the Temple" section while preserving bold text
function translateAboutToKannada() {
    return "ಶ್ರೀ ವರಸಿದ್ಧಿ ವಿನಾಯಕ ದೇವಸ್ಥಾನಕ್ಕೆ ಸುಸ್ವಾಗತ, ಬುದ್ಧಿವಂತಿಕೆ, ಸಮೃದ್ಧಿ ಮತ್ತು ಯಶಸ್ಸಿನ ಸಾಕಾರವಾದ ಗಣೇಶನಿಗೆ ಮೀಸಲಾದ ಪವಿತ್ರ ಸ್ವರ್ಗ. ಅರವಿಂದ ಓಯಸಿಸ್‌ನ ರೋಮಾಂಚಕ ಸಮುದಾಯದೊಳಗೆ ನೆಲೆಸಿರುವ ನಮ್ಮ ದೇವಾಲಯವು ಆಧ್ಯಾತ್ಮಿಕತೆ ಮತ್ತು ಸಂಪ್ರದಾಯದ ದಾರಿದೀಪವಾಗಿದೆ. ದೇವಾಲಯದ ಪ್ರಯಾಣವು <strong>ನವೆಂಬರ್ 23, 2023</strong> ರಂದು ಮಂಗಳಕರವಾದ ಭೂಮಿ ಪೂಜೆಯೊಂದಿಗೆ ಪ್ರಾರಂಭವಾಯಿತು, ನಂತರ 48 ದಿನಗಳ ಪವಿತ್ರ ಮಂಡಲ ಪೂಜೆ, <strong>ಮಾರ್ಚ್ 14, 2024</strong> ರಂದು ಭವ್ಯವಾದ ಪ್ರಾಣಪ್ರತಿಷ್ಠಾಪನೆಯಲ್ಲಿ ಕೊನೆಗೊಂಡಿತು. ಈ ಪರಿವರ್ತಕ ಘಟನೆಗಳಿಗೆ ಅರವಿಂದ್ ಓಯಸಿಸ್‌ನ ಭಕ್ತರು ಸಾಕ್ಷಿಯಾದರು, ದೇವಾಲಯವು ಆಳವಾದ ನಂಬಿಕೆ ಮತ್ತು ಸಮುದಾಯ ಮನೋಭಾವದ ಸ್ಥಳವಾಗಿದೆ. ದೈನಂದಿನ ಆಚರಣೆಗಳು, ವಿಶೇಷ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಕೂಟಗಳ ಶ್ರೀಮಂತ ಸಂಪ್ರದಾಯಗಳನ್ನು ನಾವು ಆಚರಿಸುವಾಗ ನಮ್ಮೊಂದಿಗೆ ಸೇರಿಕೊಳ್ಳಿ, ಈ ಎಲ್ಲಾ ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳು ನಮ್ಮನ್ನು ದೈವಿಕ ಆಶೀರ್ವಾದಕ್ಕೆ ಹತ್ತಿರ ಮಾಡುತ್ತವೆ.";
}

function translateAboutToEnglish() {
    return "Welcome to Shri Varasiddhi Vinayaka Temple, a sacred haven devoted to Lord Ganesha, the embodiment of wisdom, prosperity, and success. Nestled within the vibrant community of Arvind Oasis, our temple stands as a beacon of spirituality and tradition. The temple's journey began with the auspicious Bhoomi Puja on <strong>November 23rd, 2023</strong>, followed by 48 days of the sacred Mandala Puja, culminating in the grand Pranaprathistapana on <strong>March 14th, 2024</strong>. These transformative events, witnessed by the devoted residents of Arvind Oasis, mark the temple as a place of deep faith and community spirit. Join us as we celebrate the rich traditions of daily rituals, special puja events, and spiritual gatherings that bring us closer to divine blessings and unity.";
}

function link() {
    window.location.href = "form.html";
}

function link2() {
    window.open("https://docs.google.com/spreadsheets/d/1CfJ0WdT2DBdFmr4u_Z6-xIhtt73yc_e48UgzFMnDHhk/edit?usp=sharing", "_blank");
}

function link3() {
    window.open("https://docs.google.com/spreadsheets/d/1uvOow48ouaK5p0HScEJHpUkuUVi_qhWx0-RYH-2K8SY/edit?gid=0#gid=0", "_blank");
}

function link4() {
    window.open("https://docs.google.com/spreadsheets/d/1cPysMmwDhZwQcNfhoGa-bLmtRz16WldO1w7aaVYJDqw/edit?usp=sharing", "_blank");
}
function link5() {
    window.open("https://chat.whatsapp.com/Ky1DZdkCxSi54b2yJhLCul", "_blank");
}


function showOccasion(occasion) {
    // Hide both occasion galleries initially
    document.getElementById('occasion-1').style.display = 'none';
    document.getElementById('occasion-2').style.display = 'none';
    document.getElementById('occasion-3').style.display = 'none';
    document.getElementById('occasion-4').style.display = 'none';

    // Show the selected occasion gallery
    document.getElementById(`occasion-${occasion}`).style.display = 'block';
}

function redirectToUPI() {
    const upiId = "0798062a0170493.bqr@kotak"; // Your UPI ID
    const receiverName = "ARVIND OASIS APARTMENTS OWNERS ASSOCIATION TEMPLE"; // UPI holder name

    // Creating the UPI payment link without amount
    const upiPaymentLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(receiverName)}`;

    // Redirecting the user to their UPI app
    window.location.href = upiPaymentLink;
}

function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const ctaButton = document.querySelector('.cta-button');

    navLinks.classList.toggle('show');
    ctaButton.classList.toggle('hidden'); // Toggle visibility by adding/removing 'hidden' class

    if (navLinks.classList.contains('show')) {
        setTimeout(() => {
            closeMenu();
        }, 6000);
    }
}

function closeMenu() {
    const navLinks = document.querySelector('.nav-links');
    const ctaButton = document.querySelector('.cta-button');

    navLinks.classList.remove('show');
    ctaButton.classList.remove('hidden'); // Ensure the button is visible again
}

// Collapse the menu when clicking outside of the header and cta button
document.addEventListener('click', function (event) {
    const header = document.querySelector('.main-header');
    const navLinks = document.querySelector('.nav-links');
    const ctaButton = document.querySelector('.cta-button');

    if (!header.contains(event.target) && !ctaButton.contains(event.target) && navLinks.classList.contains('show')) {
        closeMenu(); // Collapse the menu
    }
});

// Add event listeners to all nav link items to collapse the menu after selection
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu); // Collapse the menu when a link is clicked
});

// Optional: Handle keydown events (like pressing the Escape key) to close the menu
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { // If the Escape key is pressed
        closeMenu(); // Collapse the menu
    }
});

function home(){
    window.location="main.html";
}

function checksignin(){
    if (localStorage.getItem('input') !== 'true') {
        window.location.href = 'index.html'; // Redirect to sign-in page if not signed in
    }
}

function idxto(){
    window.location.href='main.html';
   }

   document.querySelector('.exit-button').addEventListener('click', function() {
    localStorage.removeItem('email');
    localStorage.removeItem('flatNumber');
    localStorage.removeItem('input');
    localStorage.removeItem('residentName');
    window.location='index.html';
});