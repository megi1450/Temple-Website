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
        "The Shri Varasiddhi Vinayaka Temple is a spiritual sanctuary dedicated to Lord Ganesha, known for bringing wisdom, prosperity, and success. Join us in celebrating traditions and seeking blessings through daily rituals and special puja events.": 
        "ಶ್ರೀ ವರಸಿದ್ಧಿ ವಿನಾಯಕ ದೇವಸ್ಥಾನವು ಜ್ಞಾನ, ಸಮೃದ್ಧಿ ಮತ್ತು ಯಶಸ್ಸು ತರುವ ಗಣೇಶನಿಗೆ ಮೀಸಲಾಗಿರುವ ಆಧ್ಯಾತ್ಮಿಕ ಆಶ್ರಯವಾಗಿದೆ. ದೈನಂದಿನ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ವಿಶೇಷ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳ ಮೂಲಕ ಪರಂಪರೆಯನ್ನು ಆಚರಿಸಿ.",
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
        "ಶ್ರೀ ವರಸಿದ್ಧಿ ವಿನಾಯಕ ದೇವಸ್ಥಾನವು ಜ್ಞಾನ, ಸಮೃದ್ಧಿ ಮತ್ತು ಯಶಸ್ಸು ತರುವ ಗಣೇಶನಿಗೆ ಮೀಸಲಾಗಿರುವ ಆಧ್ಯಾತ್ಮಿಕ ಆಶ್ರಯವಾಗಿದೆ. ದೈನಂದಿನ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ವಿಶೇಷ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳ ಮೂಲಕ ಪರಂಪರೆಯನ್ನು ಆಚರಿಸಿ.":
        "The Shri Varasiddhi Vinayaka Temple is a spiritual sanctuary dedicated to Lord Ganesha, known for bringing wisdom, prosperity, and success. Join us in celebrating traditions and seeking blessings through daily rituals and special puja events.",
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

function closeMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.remove('show'); // Collapse the menu
}
