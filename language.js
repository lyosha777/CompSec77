function changeLanguage(language) {
    // Store the selected language in localStorage
    localStorage.setItem('selectedLanguage', language);
    
    // Update all translatable elements
    document.querySelector('#hero h1').textContent = translations[language].welcome;
    document.querySelector('#hero p').textContent = translations[language].tagline;
    document.querySelector('#services h2').textContent = translations[language].services;
    
    // Update service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards[0].querySelector('h3').textContent = translations[language].visaServices;
    serviceCards[0].querySelector('p').textContent = translations[language].visaDesc;
    serviceCards[1].querySelector('h3').textContent = translations[language].passportServices;
    serviceCards[1].querySelector('p').textContent = translations[language].passportDesc;
    serviceCards[2].querySelector('h3').textContent = translations[language].culturalExchange;
    serviceCards[2].querySelector('p').textContent = translations[language].culturalDesc;
    serviceCards[3].querySelector('h3').textContent = translations[language].businessSupport;
    serviceCards[3].querySelector('p').textContent = translations[language].businessDesc;
    
    // Update contact section
    document.querySelector('#contact h2').textContent = translations[language].contactUs;
    const contactDivs = document.querySelectorAll('.contact-info > div');
    contactDivs[0].querySelector('h3').textContent = translations[language].address;
    contactDivs[1].querySelector('h3').textContent = translations[language].phone;
    contactDivs[2].querySelector('h3').textContent = translations[language].email;
    
    // Update footer
    const footerSections = document.querySelectorAll('.footer-section');
    footerSections[0].querySelector('h4').textContent = translations[language].workingHours;
    footerSections[0].querySelectorAll('p')[0].textContent = translations[language].workingTime;
    footerSections[0].querySelectorAll('p')[1].textContent = translations[language].weekend;
    footerSections[1].querySelector('h4').textContent = translations[language].emergency;
    footerSections[1].querySelector('p').textContent = translations[language].emergencyContact;
    footerSections[2].querySelector('h4').textContent = translations[language].socialMedia;
    
    // Update HTML lang attribute
    document.documentElement.lang = language;
}

// Set initial language based on localStorage or default to English
document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    document.getElementById('languageSelect').value = savedLanguage;
    changeLanguage(savedLanguage);
}); 