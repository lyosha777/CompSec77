// Translations for login page
const translations = {
    en: {
        welcome: 'Welcome to the Embassy Portal',
        tagline: 'Your Gateway to Diplomatic Services',
        services: 'Our Services',
        visaServices: 'Visa Services',
        visaDesc: 'Apply for and track your visa applications',
        passportServices: 'Passport Services',
        passportDesc: 'Passport renewal and emergency services',
        culturalExchange: 'Cultural Exchange',
        culturalDesc: 'Programs promoting cultural understanding',
        businessSupport: 'Business Support',
        businessDesc: 'Trade and business delegation services',
        contactUs: 'Contact Us',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        workingHours: 'Working Hours',
        workingTime: 'Monday - Friday: 9:00 - 17:00',
        weekend: 'Saturday - Sunday: Closed',
        emergency: 'Emergency Contact',
        emergencyContact: '24/7 Emergency: +1-555-0123',
        socialMedia: 'Follow Us'
    },
    ku: {
        welcome: 'بەخێربێن بۆ پۆرتاڵی باڵیۆزخانە',
        tagline: 'دەروازەی خزمەتگوزارییە دیپلۆماسییەکان',
        services: 'خزمەتگوزارییەکانمان',
        visaServices: 'خزمەتگوزاریی ڤیزا',
        visaDesc: 'داواکردن و بەدواداچوونی داواکارییەکانی ڤیزا',
        passportServices: 'خزمەتگوزاریی پاسپۆرت',
        passportDesc: 'نوێکردنەوەی پاسپۆرت و خزمەتگوزارییە تەنگەتاوییەکان',
        culturalExchange: 'ئاڵوگۆڕی کەلتووری',
        culturalDesc: 'بەرنامەکانی پەرەپێدانی تێگەیشتنی کەلتووری',
        businessSupport: 'پشتگیریی بازرگانی',
        businessDesc: 'خزمەتگوزارییەکانی شاندی بازرگانی',
        contactUs: 'پەیوەندیمان پێوە بکە',
        address: 'ناونیشان',
        phone: 'تەلەفۆن',
        email: 'ئیمەیڵ',
        workingHours: 'کاتەکانی کارکردن',
        workingTime: 'دووشەممە - هەینی: ٩:٠٠ - ١٧:٠٠',
        weekend: 'شەممە - یەکشەممە: داخراوە',
        emergency: 'پەیوەندی لەکاتی تەنگانە',
        emergencyContact: 'تەنگانە ٢٤/٧: +١-٥٥٥-٠١٢٣',
        socialMedia: 'شوێنمان بکەوە'
    },
    hy: {
        welcome: 'Բարի գալուստ դեսպանատան պորտալ',
        tagline: 'Ձեր դարպասը դիվանագիտական ծառայություններին',
        services: 'Մեր ծառայությունները',
        visaServices: 'Վիզայի ծառայություններ',
        visaDesc: 'Դիմեք և հետևեք ձեր վիզայի դիմումներին',
        passportServices: 'Անձնագրային ծառայություններ',
        passportDesc: 'Անձնագրի նորացում և արտակարգ ծառայություններ',
        culturalExchange: 'Մշակութային փոխանակում',
        culturalDesc: 'Մշակութային փոխըմբռնման խթանման ծրագրեր',
        businessSupport: 'Բիզնես աջակցություն',
        businessDesc: 'Առևտրային և բիզնես պատվիրակության ծառայություններ',
        contactUs: 'Կապ մեզ հետ',
        address: 'Հասցե',
        phone: 'Հեռախոս',
        email: 'Էլ. փոստ',
        workingHours: 'Աշխատանքային ժամեր',
        workingTime: 'Երկուշաբթի - Ուրբաթ: 9:00 - 17:00',
        weekend: 'Շաբաթ - Կիրակի: Փակ է',
        emergency: 'Արտակարգ կապ',
        emergencyContact: '24/7 Արտակարգ: +1-555-0123',
        socialMedia: 'Հետևեք մեզ'
    },
    de: {
        welcome: 'Willkommen im Botschaftsportal',
        tagline: 'Ihr Zugang zu diplomatischen Diensten',
        services: 'Unsere Dienstleistungen',
        visaServices: 'Visa-Dienste',
        visaDesc: 'Beantragen und verfolgen Sie Ihre Visumanträge',
        passportServices: 'Pass-Dienste',
        passportDesc: 'Passerneuerung und Notfalldienste',
        culturalExchange: 'Kultureller Austausch',
        culturalDesc: 'Programme zur Förderung des kulturellen Verständnisses',
        businessSupport: 'Geschäftsunterstützung',
        businessDesc: 'Handels- und Geschäftsdelegationsdienste',
        contactUs: 'Kontaktieren Sie uns',
        address: 'Adresse',
        phone: 'Telefon',
        email: 'E-Mail',
        workingHours: 'Öffnungszeiten',
        workingTime: 'Montag - Freitag: 9:00 - 17:00',
        weekend: 'Samstag - Sonntag: Geschlossen',
        emergency: 'Notfallkontakt',
        emergencyContact: '24/7 Notfall: +1-555-0123',
        socialMedia: 'Folgen Sie uns'
    }
};

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