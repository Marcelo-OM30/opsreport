// COLA ESTE CÓDIGO NO CONSOLE DO NAVEGADOR (F12)

console.log('🔍 === TESTE TEAMS DEBUG ===');

// Verificar se CONFIG existe
if (typeof CONFIG === 'undefined') {
    console.log('❌ CONFIG não definido');
} else {
    console.log('✅ CONFIG encontrado');
    console.log('TEAMS_ENABLED:', CONFIG.TEAMS_ENABLED);
    console.log('TEAMS_WEBHOOK_URL:', CONFIG.TEAMS_WEBHOOK_URL ? 'Configurado' : 'Não configurado');
    console.log('TEAMS_CONFIG:', CONFIG.TEAMS_CONFIG);
}

// Teste direto de envio
if (typeof enviarParaTeams === 'function') {
    console.log('✅ Função enviarParaTeams encontrada - testando...');
    
    const relatorioTeste = {
        id: Date.now(),
        prefeitura: 'Debug',
        opsInfo: 'Teste Console',
        versaoSistema: 'v1.0-debug',
        ambiente: 'Teste',
        criticidade: 5,
        timestamp: Date.now(),
        tarefas: [{id: 1, texto: 'Teste direto no console'}],
        conclusao: 'Este é um teste direto via console do navegador'
    };
    
    enviarParaTeams(relatorioTeste, 'debug')
        .then(result => {
            console.log('✅ Resultado do teste:', result);
        })
        .catch(error => {
            console.log('❌ Erro no teste:', error);
        });
} else {
    console.log('❌ Função enviarParaTeams não encontrada');
}

// Teste de webhook direto
if (CONFIG?.TEAMS_WEBHOOK_URL) {
    console.log('🧪 Testando webhook diretamente...');
    
    fetch(CONFIG.TEAMS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: '🧪 Teste direto do console - ' + new Date().toLocaleString()
        })
    })
    .then(response => {
        console.log('📤 Resposta do webhook:', response.status, response.statusText);
        return response.text();
    })
    .then(text => {
        console.log('📥 Corpo da resposta:', text);
    })
    .catch(error => {
        console.log('❌ Erro no webhook:', error);
    });
}
