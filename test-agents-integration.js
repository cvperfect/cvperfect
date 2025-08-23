/**
 * Test integracji Claude Code z systemem agentów CVPerfect
 */

const { processTask, getStatus, isInCVPerfect } = require('./claude-cvperfect-integration');

async function testIntegration() {
    console.log('🧪 Rozpoczynam test integracji Claude <-> CVPerfect Agents\n');
    
    // Test 1: Sprawdź status systemu
    console.log('1️⃣ Test: Status systemu');
    const status = getStatus();
    console.log('📊 Status:', JSON.stringify(status, null, 2));
    console.log('✅ Test statusu zakończony\n');
    
    // Test 2: Sprawdź wykrywanie projektu CVPerfect
    console.log('2️⃣ Test: Wykrywanie projektu CVPerfect');
    const inCVPerfect = isInCVPerfect();
    console.log(`📂 W projekcie CVPerfect: ${inCVPerfect}`);
    console.log('✅ Test wykrywania zakończony\n');
    
    // Test 3: Zadanie frontend (powinno użyć agentów)
    console.log('3️⃣ Test: Zadanie frontend');
    try {
        const frontendResult = await processTask('Dodaj nowy komponent React do strony głównej', { timeout: 5000 });
        console.log('🎯 Rezultat frontend:', JSON.stringify(frontendResult, null, 2));
    } catch (error) {
        console.log('❌ Błąd frontend:', error.message);
    }
    console.log('✅ Test frontend zakończony\n');
    
    // Test 4: Zadanie CV (powinno użyć agentów)
    console.log('4️⃣ Test: Zadanie optymalizacji CV');
    try {
        const cvResult = await processTask('Optymalizuj szablon CV dla lepszego ATS scoring', { timeout: 5000 });
        console.log('📄 Rezultat CV:', JSON.stringify(cvResult, null, 2));
    } catch (error) {
        console.log('❌ Błąd CV:', error.message);
    }
    console.log('✅ Test CV zakończony\n');
    
    // Test 5: Zadanie ogólne (może nie użyć agentów)
    console.log('5️⃣ Test: Zadanie ogólne');
    try {
        const generalResult = await processTask('Wyświetl aktualną datę', { timeout: 5000 });
        console.log('📅 Rezultat ogólne:', JSON.stringify(generalResult, null, 2));
    } catch (error) {
        console.log('❌ Błąd ogólne:', error.message);
    }
    console.log('✅ Test ogólny zakończony\n');
    
    // Test 6: Sprawdź status po testach
    console.log('6️⃣ Test: Status po wykonanych zadaniach');
    const finalStatus = getStatus();
    console.log('📊 Status końcowy:', JSON.stringify(finalStatus, null, 2));
    console.log('✅ Test statusu końcowego zakończony\n');
    
    console.log('🎉 Wszystkie testy integracji zakończone!');
    console.log('📋 Podsumowanie:');
    console.log(`   - W projekcie CVPerfect: ${inCVPerfect}`);
    console.log(`   - Integracja aktywna: ${status.integrationActive}`);
    console.log(`   - System agentów: ${status.systemStatus ? 'Dostępny' : 'Niedostępny'}`);
}

// Uruchom testy
if (require.main === module) {
    testIntegration().catch(error => {
        console.error('💥 Krytyczny błąd testów:', error);
        process.exit(1);
    });
}

module.exports = { testIntegration };