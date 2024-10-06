function toggleLanguage() {
    const currentLang = document.documentElement.lang;
    if (currentLang === "en") {
        document.documentElement.lang = "kn"; // Change to Kannada
        document.querySelectorAll("h2, p, a").forEach(el => {
            el.textContent = translateToKannada(el.textContent); // Translate text
        });
    } else {
        document.documentElement.lang = "en"; // Change back to English
        document.querySelectorAll("h2, p, a").forEach(el => {
            el.textContent = translateToEnglish(el.textContent); // Translate text
        });
    }
}

function translateToKannada(text) {
    // Simple translation logic (expand as needed)
    const translations = {
        "Welcome to Shri Varasiddhi Vinayaka Temple": "ಶ್ರೀ ವರಸಿದ್ಧಿ ವಿನಾಯಕ ದೇವಸ್ಥಾನಕ್ಕೆ ಸ್ವಾಗತ",
        "Experience the divine grace and peace at our sacred temple.": "ನಮ್ಮ ಪವಿತ್ರ ದೇವಾಲಯದಲ್ಲಿ ದೈವಿಕ ಕೃಪೆ ಮತ್ತು ಶಾಂತಿಯನ್ನು ಅನುಭವಿಸಿ.",
        "View Puja Events": "ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
        "About the Temple": "ದೇವಾಲಯದ ಬಗ್ಗೆ",
        "Welcome to Shri Varasiddhi Vinayaka Temple, a sacred haven devoted to Lord Ganesha, the embodiment of wisdom, prosperity, and success. Nestled within the vibrant community of Arvind Oasis, our temple stands as a beacon of spirituality and tradition. The temple's journey began with the auspicious Bhoomi Puja on November 23rd, 2023, followed by 48 days of the sacred Mandala Puja, culminating in the grand Pranaprathistapana on March 14th, 2024. These transformative events, witnessed by the devoted residents of Arvind Oasis, mark the temple as a place of deep faith and community spirit. Join us as we celebrate the rich traditions of daily rituals, special puja events, and spiritual gatherings that bring us closer to divine blessings and unity.": 
        "ಶ್ರೀ ವರಸಿದ್ಧಿ ವಿನಾಯಕ ದೇವಸ್ಥಾನಕ್ಕೆ ಸುಸ್ವಾಗತ, ಬುದ್ಧಿವಂತಿಕೆ, ಸಮೃದ್ಧಿ ಮತ್ತು ಯಶಸ್ಸಿನ ಸಾಕಾರವಾದ ಗಣೇಶನಿಗೆ ಮೀಸಲಾದ ಪವಿತ್ರ ಸ್ವರ್ಗ. ಅರವಿಂದ ಓಯಸಿಸ್‌ನ ರೋಮಾಂಚಕ ಸಮುದಾಯದೊಳಗೆ ನೆಲೆಸಿರುವ ನಮ್ಮ ದೇವಾಲಯವು ಆಧ್ಯಾತ್ಮಿಕತೆ ಮತ್ತು ಸಂಪ್ರದಾಯದ ದಾರಿದೀಪವಾಗಿದೆ. ದೇವಾಲಯದ ಪ್ರಯಾಣವು ನವೆಂಬರ್ 23, 2023 ರಂದು ಮಂಗಳಕರವಾದ ಭೂಮಿ ಪೂಜೆಯೊಂದಿಗೆ ಪ್ರಾರಂಭವಾಯಿತು, ನಂತರ 48 ದಿನಗಳ ಪವಿತ್ರ ಮಂಡಲ ಪೂಜೆ, ಮಾರ್ಚ್ 14, 2024 ರಂದು ಭವ್ಯವಾದ ಪ್ರಾಣಪ್ರತಿಷ್ಠಾಪನೆಯಲ್ಲಿ ಕೊನೆಗೊಂಡಿತು. ಈ ಪರಿವರ್ತಕ ಘಟನೆಗಳಿಗೆ ಅರವಿಂದ್ ಓಯಸಿಸ್‌ನ ಭಕ್ತರು ಸಾಕ್ಷಿಯಾದರು. ದೇವಾಲಯವು ಆಳವಾದ ನಂಬಿಕೆ ಮತ್ತು ಸಮುದಾಯ ಮನೋಭಾವದ ಸ್ಥಳವಾಗಿದೆ. ದೈವಿಕ ಆಶೀರ್ವಾದ ಮತ್ತು ಏಕತೆಗೆ ನಮ್ಮನ್ನು ಹತ್ತಿರ ತರುವ ದೈನಂದಿನ ಆಚರಣೆಗಳು, ವಿಶೇಷ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಕೂಟಗಳ ಶ್ರೀಮಂತ ಸಂಪ್ರದಾಯಗಳನ್ನು ನಾವು ಆಚರಿಸುವಾಗ ನಮ್ಮೊಂದಿಗೆ ಸೇರಿಕೊಳ್ಳಿ.",
        // Add more translations as needed
    };
    return translations[text] || text;
}

function translateToEnglish(text) {
    // Reverse translation (expand as needed)
    const translations = {
        "ಶ್ರೀ ವರಸಿದ್ಧಿ ವಿನಾಯಕ ದೇವಸ್ಥಾನಕ್ಕೆ ಸ್ವಾಗತ": "Welcome to Shri Varasiddhi Vinayaka Temple",
        "ನಮ್ಮ ಪವಿತ್ರ ದೇವಾಲಯದಲ್ಲಿ ದೈವಿಕ ಕೃಪೆ ಮತ್ತು ಶಾಂತಿಯನ್ನು ಅನುಭವಿಸಿ.": "Experience the divine grace and peace at our sacred temple.",
        "ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ": "View Puja Events",
        "ದೇವಾಲಯದ ಬಗ್ಗೆ": "About the Temple",
        "ಶ್ರೀ ವರಸಿದ್ಧಿ ವಿನಾಯಕ ದೇವಸ್ಥಾನಕ್ಕೆ ಸುಸ್ವಾಗತ, ಬುದ್ಧಿವಂತಿಕೆ, ಸಮೃದ್ಧಿ ಮತ್ತು ಯಶಸ್ಸಿನ ಸಾಕಾರವಾದ ಗಣೇಶನಿಗೆ ಮೀಸಲಾದ ಪವಿತ್ರ ಸ್ವರ್ಗ. ಅರವಿಂದ ಓಯಸಿಸ್‌ನ ರೋಮಾಂಚಕ ಸಮುದಾಯದೊಳಗೆ ನೆಲೆಸಿರುವ ನಮ್ಮ ದೇವಾಲಯವು ಆಧ್ಯಾತ್ಮಿಕತೆ ಮತ್ತು ಸಂಪ್ರದಾಯದ ದಾರಿದೀಪವಾಗಿದೆ. ದೇವಾಲಯದ ಪ್ರಯಾಣವು ನವೆಂಬರ್ 23, 2023 ರಂದು ಮಂಗಳಕರವಾದ ಭೂಮಿ ಪೂಜೆಯೊಂದಿಗೆ ಪ್ರಾರಂಭವಾಯಿತು, ನಂತರ 48 ದಿನಗಳ ಪವಿತ್ರ ಮಂಡಲ ಪೂಜೆ, ಮಾರ್ಚ್ 14, 2024 ರಂದು ಭವ್ಯವಾದ ಪ್ರಾಣಪ್ರತಿಷ್ಠಾಪನೆಯಲ್ಲಿ ಕೊನೆಗೊಂಡಿತು. ಈ ಪರಿವರ್ತಕ ಘಟನೆಗಳಿಗೆ ಅರವಿಂದ್ ಓಯಸಿಸ್‌ನ ಭಕ್ತರು ಸಾಕ್ಷಿಯಾದರು. ದೇವಾಲಯವು ಆಳವಾದ ನಂಬಿಕೆ ಮತ್ತು ಸಮುದಾಯ ಮನೋಭಾವದ ಸ್ಥಳವಾಗಿದೆ. ದೈವಿಕ ಆಶೀರ್ವಾದ ಮತ್ತು ಏಕತೆಗೆ ನಮ್ಮನ್ನು ಹತ್ತಿರ ತರುವ ದೈನಂದಿನ ಆಚರಣೆಗಳು, ವಿಶೇಷ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಕೂಟಗಳ ಶ್ರೀಮಂತ ಸಂಪ್ರದಾಯಗಳನ್ನು ನಾವು ಆಚರಿಸುವಾಗ ನಮ್ಮೊಂದಿಗೆ ಸೇರಿಕೊಳ್ಳಿ.":
        "Welcome to Shri Varasiddhi Vinayaka Temple, a sacred haven devoted to Lord Ganesha, the embodiment of wisdom, prosperity, and success. Nestled within the vibrant community of Arvind Oasis, our temple stands as a beacon of spirituality and tradition. The temple's journey began with the auspicious Bhoomi Puja on November 23rd, 2023, followed by 48 days of the sacred Mandala Puja, culminating in the grand Pranaprathistapana on March 14th, 2024. These transformative events, witnessed by the devoted residents of Arvind Oasis, mark the temple as a place of deep faith and community spirit. Join us as we celebrate the rich traditions of daily rituals, special puja events, and spiritual gatherings that bring us closer to divine blessings and unity.",
        // Add more translations as needed
    };
    return translations[text] || text;
}

function link(){
    window.location.href="https://1drv.ms/x/c/8269a612c72a1543/EWfQFYblxU1CgBfL6iHQUq8B-7zsqPWgb2cAjxvGPYxGGw?e=WhhCRs";
}
function link2(){
    window.location.href="https://docs.google.com/spreadsheets/d/1CfJ0WdT2DBdFmr4u_Z6-xIhtt73yc_e48UgzFMnDHhk/edit?usp=sharing";
}
function showOccasion(occasion) {
    // Hide both occasion galleries initially
    document.getElementById('occasion-1').style.display = 'none';
    document.getElementById('occasion-2').style.display = 'none';
    document.getElementById('occasion-3').style.display = 'none';

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
    navLinks.classList.toggle('show'); // Toggle the 'show' class
}

// Collapse the menu when clicking a link
function closeMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.remove('show'); // Collapse the menu
}

// Collapse the menu when clicking outside the header and cta button
document.addEventListener('click', function(event) {
    const header = document.querySelector('.main-header');
    const navLinks = document.querySelector('.nav-links');
    const ctaButton = document.querySelector('.cta-button'); // Select your cta button

    // Check if the clicked element is not within the header or the cta button
    if (!header.contains(event.target) && !ctaButton.contains(event.target) && navLinks.classList.contains('show')) {
        closeMenu(); // Collapse the menu
    }
});

function home(){
    window.location="index.html";
}
