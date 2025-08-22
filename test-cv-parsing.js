const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCVParsing() {
    console.log('🧪 TEST CV PARSING PIPELINE 🧪\n');

    // Test CV data - 2-page equivalent
    const testCV = `
Konrad Jakóbczak
Email: konrad11811@wp.pl
Telefon: 570 625 098
Adres: ul. Przykładowa 123, 00-000 Warszawa

PROFIL ZAWODOWY
Doświadczony specjalista w obsłudze klienta z 8-letnim stażem w różnych branżach. Wykazuję się wysokimi umiejętnościami komunikacyjnymi i zdolnością do rozwiązywania problemów. Skutecznie zarządzam czasem i pracuję pod presją terminów.

DOŚWIADCZENIE ZAWODOWE

Konsultant ds. Obsługi Klienta | ABC Corporation | 2020-2024
• Obsługa 50+ klientów dziennie przez telefon i email
• Rozwiązywanie skomplikowanych reklamacji i problemów technicznych
• Współpraca z działem technicznym w celu szybkiego rozwiązania problemów
• Prowadzenie szkoleń dla nowych pracowników
• Osiągnięcie 95% satysfakcji klientów w ankietach oceny

Sprzedawca | Sklep DEF | 2018-2020  
• Sprzedaż produktów elektronicznych i doradztwo klientom
• Realizacja celów sprzedażowych na poziomie 110% miesięcznie
• Prowadzenie inwentaryzacji i kontrola stanu magazynu
• Obsługa kasy fiskalnej i systemu POS
• Budowanie długotrwałych relacji z klientami stałymi

Logistyk | Firma GHI | 2016-2018
• Koordynacja dostaw i zarządzanie magazynem
• Optymalizacja tras dostawczych
• Współpraca z kurierami i firmami transportowymi  
• Nadzór nad jakością pakowania produktów
• Utrzymanie 98% terminowości dostaw

WYKSZTAŁCENIE

Technikum Ekonomiczne im. Jana Kowalskiego, Warszawa | 2012-2016
Kierunek: Technik handlowiec
Dyplom z wyróżnieniem

Kursy i certyfikaty:
• Kurs Obsługi Klienta - Centrum Szkoleniowe XYZ (2019)
• Certyfikat Microsoft Office - podstawowy i zaawansowany (2020)
• Szkolenie z zarządzania stresem w pracy (2021)
• Kurs sprzedaży konsultacyjnej (2022)

UMIEJĘTNOŚCI

Umiejętności techniczne:
• Znajomość pakietu Microsoft Office (Word, Excel, PowerPoint)
• Obsługa systemów CRM (Salesforce, HubSpot)
• Znajomość języka angielskiego - poziom B2
• Podstawy języka niemieckiego - poziom A2
• Obsługa kas fiskalnych i systemów POS

Umiejętności miękkie:
• Doskonałe umiejętności komunikacyjne
• Zarządzanie czasem i organizacja pracy
• Rozwiązywanie problemów i myślenie analityczne
• Praca w zespole i indywidualna
• Odporność na stres i pracę pod presją czasu
• Elastyczność i szybka adaptacja do zmian

JĘZYKI OBCE
• Polski - język ojczysty
• Angielski - poziom B2 (biegły)
• Niemiecki - poziom A2 (podstawowy)

ZAINTERESOWANIA
Czytanie książek biznesowych, podróże, gotowanie, sport (piłka nożna, siatkówka)
    `.trim();

    console.log('1️⃣ Original CV length:', testCV.length, 'characters');
    console.log('2️⃣ Testing API /analyze...\n');

    try {
        const response = await fetch('http://localhost:3004/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentCV: testCV,
                jobPosting: 'Specjalista ds. Obsługi Klienta w nowoczesnej firmie IT',
                email: 'test@cvperfect.pl',
                paid: true,
                sessionId: 'test_parsing_123'
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            console.log('✅ AI Response received');
            console.log('📊 Optimized CV length:', result.optimizedCV.length, 'characters');
            console.log('📝 First 500 chars of optimized CV:');
            console.log(result.optimizedCV.substring(0, 500) + '...\n');

            // Test the parsing function
            console.log('3️⃣ Testing parseOptimizedCV function...\n');
            
            // Simulate the parsing function from success.js
            const parseOptimizedCV = (htmlContent) => {
                console.log('🔍 Raw HTML input length:', htmlContent.length);
                
                const nameMatch = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
                const emailMatch = htmlContent.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                const phoneMatch = htmlContent.match(/(\+?[\d\s\-\(\)]{9,})/);
                
                console.log('📝 Extracted basic data:');
                console.log('   Name:', nameMatch ? nameMatch[1].trim() : 'NOT FOUND');
                console.log('   Email:', emailMatch ? emailMatch[1] : 'NOT FOUND');
                console.log('   Phone:', phoneMatch ? phoneMatch[1].trim() : 'NOT FOUND');
                
                // Extract experience entries
                const experiencePatterns = [
                    /<li[^>]*>(.*?)<\/li>/gi,
                    /<p[^>]*class="[^"]*experience[^"]*"[^>]*>(.*?)<\/p>/gi,
                    /<div[^>]*class="[^"]*job[^"]*"[^>]*>(.*?)<\/div>/gi,
                    /(\d{4}[\s\-]\d{4}.*?(?=\n\n|\n\d{4}|$))/gi
                ];
                
                let allExperience = [];
                experiencePatterns.forEach((pattern, index) => {
                    const matches = htmlContent.match(pattern) || [];
                    console.log(`   Experience pattern ${index + 1}: ${matches.length} matches`);
                    matches.forEach(match => {
                        const cleanText = match.replace(/<[^>]*>/g, '').trim();
                        if (cleanText && cleanText.length > 10) {
                            allExperience.push(cleanText);
                        }
                    });
                });
                
                console.log('💼 Total experience entries extracted:', allExperience.length);
                allExperience.slice(0, 3).forEach((exp, i) => {
                    console.log(`   ${i + 1}. ${exp.substring(0, 100)}...`);
                });
                
                return {
                    name: nameMatch ? nameMatch[1].trim() : 'Unknown',
                    email: emailMatch ? emailMatch[1] : '',
                    phone: phoneMatch ? phoneMatch[1].trim() : '',
                    experience: allExperience,
                    experienceCount: allExperience.length
                };
            };
            
            const parsedData = parseOptimizedCV(result.optimizedCV);
            
            console.log('\n📊 PARSING RESULTS:');
            console.log('✅ Name:', parsedData.name);
            console.log('✅ Email:', parsedData.email);
            console.log('✅ Phone:', parsedData.phone);
            console.log('✅ Experience entries:', parsedData.experienceCount);
            console.log('✅ Skills:', parsedData.skills ? parsedData.skills.length : 0);
            
            console.log('\n🔍 DETAILED EXPERIENCE ANALYSIS:');
            if (parsedData.experience && parsedData.experience.length > 0) {
                parsedData.experience.slice(0, 5).forEach((exp, i) => {
                    console.log(`${i + 1}. [${exp.length} chars] ${exp.substring(0, 120)}...`);
                });
                
                if (parsedData.experience.length > 5) {
                    console.log(`... and ${parsedData.experience.length - 5} more entries`);
                }
            } else {
                console.log('❌ NO EXPERIENCE DATA FOUND!');
            }
            
            if (parsedData.experienceCount < 3) {
                console.log('\n❌ PROBLEM DETECTED: Too few experience entries extracted!');
                console.log('🔍 Let\'s analyze the HTML structure...\n');
                
                // Analyze HTML structure
                const h2Matches = result.optimizedCV.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
                console.log('📋 H2 sections found:', h2Matches.length);
                h2Matches.forEach(h2 => {
                    console.log('   -', h2.replace(/<[^>]*>/g, ''));
                });
                
                const ulMatches = result.optimizedCV.match(/<ul[^>]*>[\s\S]*?<\/ul>/gi) || [];
                console.log('📝 UL lists found:', ulMatches.length);
                
                const liMatches = result.optimizedCV.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || [];
                console.log('📝 LI items found:', liMatches.length);
                
                console.log('\n🔧 DEBUGGING: Full HTML structure:');
                console.log(result.optimizedCV);
            }
            
        } else {
            console.error('❌ API returned error:', result.error);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCVParsing().catch(console.error);