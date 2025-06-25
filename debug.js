// COLE ESTE CÓDIGO NO CONSOLE DO NAVEGADOR PARA TESTAR

// 1. Limpar localStorage (começar do zero)
function limparTudo() {
    localStorage.removeItem('opsReports');
    location.reload();
}

// 2. Criar relatório de teste
function criarRelatórioTeste() {
    const testReport = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        timestampBR: new Date().toLocaleString('pt-BR'),
        prefeitura: 'Prefeitura Teste',
        opsInfo: 'OPS-001-TESTE',
        versaoSistema: '1.0.0',
        ambiente: 'homologacao',
        erros: 'Nenhum erro de teste',
        criticidade: 5,
        tarefas: [
            { id: 1, texto: 'Tarefa de teste 1', timestamp: new Date().toLocaleString('pt-BR') },
            { id: 2, texto: 'Tarefa de teste 2', timestamp: new Date().toLocaleString('pt-BR') }
        ],
        avaliacaoQA: 'Teste aprovado',
        conclusao: 'aprovado'
    };
    
    // Salvar no localStorage
    let relatorios = JSON.parse(localStorage.getItem('opsReports') || '[]');
    relatorios.unshift(testReport);
    localStorage.setItem('opsReports', JSON.stringify(relatorios));
    
    // Recarregar os relatórios
    loadReports();
    
    console.log('Relatório de teste criado!');
}

// 3. Verificar estado dos botões
function verificarBotões() {
    const excelBtn = document.getElementById('exportExcel');
    const wordBtn = document.getElementById('exportWord');
    const reports = JSON.parse(localStorage.getItem('opsReports') || '[]');
    
    console.log('=== ESTADO DOS BOTÕES ===');
    console.log('Relatórios no localStorage:', reports.length);
    console.log('Botão Excel encontrado:', !!excelBtn);
    console.log('Botão Word encontrado:', !!wordBtn);
    console.log('Botão Excel desabilitado:', excelBtn?.disabled);
    console.log('Botão Word desabilitado:', wordBtn?.disabled);
    console.log('Conteúdo botão Excel:', excelBtn?.innerHTML);
    console.log('Conteúdo botão Word:', wordBtn?.innerHTML);
}

// 4. Forçar atualização dos botões
function forçarAtualizaçãoBotões() {
    const reports = JSON.parse(localStorage.getItem('opsReports') || '[]');
    updateExportButtons(reports.length > 0);
    console.log('Botões atualizados para:', reports.length > 0);
}

// === FUNÇÕES DE DEBUG GITHUB ===

// 5. Testar configuração do GitHub
function testarConfigGitHub() {
    console.log('=== TESTE CONFIGURAÇÃO GITHUB ===');
    console.log('CONFIG existe:', typeof CONFIG !== 'undefined');
    if (typeof CONFIG !== 'undefined') {
        console.log('Token configurado:', !!CONFIG.GITHUB_TOKEN);
        console.log('Token válido:', CONFIG.GITHUB_TOKEN !== 'SEU_TOKEN_AQUI' && CONFIG.GITHUB_TOKEN !== 'SEU_NOVO_TOKEN_AQUI');
        console.log('Repo configurado:', CONFIG.GITHUB_REPO);
        console.log('Repo válido:', CONFIG.GITHUB_REPO !== 'usuario/repositorio');
        
        // Testar se o repo existe
        const [owner, repo] = CONFIG.GITHUB_REPO.split('/');
        console.log('Owner:', owner);
        console.log('Repo:', repo);
    } else {
        console.error('❌ CONFIG não foi carregado!');
    }
}

// 6. Testar conexão com GitHub (sem salvar)
async function testarConexãoGitHub() {
    console.log('=== TESTE CONEXÃO GITHUB ===');
    
    if (typeof CONFIG === 'undefined' || !CONFIG.GITHUB_TOKEN || CONFIG.GITHUB_TOKEN === 'SEU_NOVO_TOKEN_AQUI') {
        console.error('❌ Token não configurado corretamente');
        return;
    }
    
    try {
        const [owner, repo] = CONFIG.GITHUB_REPO.split('/');
        console.log(`🔄 Testando acesso ao repositório ${owner}/${repo}...`);
        
        // Testar leitura (não precisa de token para repos públicos)
        const readResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        console.log('📖 Teste de leitura:', readResponse.status);
        
        if (readResponse.ok) {
            const repoData = await readResponse.json();
            console.log('✅ Repositório encontrado:', repoData.full_name);
            console.log('🔓 Repositório público:', !repoData.private);
        }
        
        // Testar escrita (precisa de token)
        const writeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'GET',
            headers: {
                'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        console.log('✍️ Teste de escrita (autorização):', writeResponse.status);
        
        if (writeResponse.ok) {
            console.log('✅ Token válido e com permissões corretas');
        } else {
            console.error('❌ Problema com token ou permissões');
            const errorText = await writeResponse.text();
            console.error('Erro:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Erro na conexão:', error);
    }
}

// 7. Carregar relatórios do GitHub manualmente
async function carregarRelatóriosGitHub() {
    console.log('=== CARREGANDO RELATÓRIOS DO GITHUB ===');
    
    try {
        const githubReports = await loadReportsFromGitHub();
        console.log('📊 Relatórios encontrados no GitHub:', githubReports.length);
        githubReports.forEach((report, index) => {
            console.log(`${index + 1}. ${report.opsInfo} - ${report.author} - ${report.timestampBR}`);
        });
        return githubReports;
    } catch (error) {
        console.error('❌ Erro ao carregar do GitHub:', error);
    }
}

// 8. Testar salvamento no GitHub
async function testarSalvamentoGitHub() {
    console.log('=== TESTE SALVAMENTO GITHUB ===');
    
    const testReport = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        timestampBR: new Date().toLocaleString('pt-BR'),
        prefeitura: 'teste',
        opsInfo: 'OPS-TESTE-DEBUG',
        versaoSistema: '1.0.0-test',
        ambiente: 'homologacao',
        erros: 'Teste de sincronização',
        criticidade: 1,
        tarefas: [{ id: 1, texto: 'Teste debug', timestamp: new Date().toLocaleString('pt-BR') }],
        avaliacaoQA: 'Teste de debug para sincronização',
        conclusao: 'aprovado'
    };
    
    try {
        console.log('🔄 Tentando salvar relatório de teste...');
        await salvarRelatorio(testReport);
        console.log('✅ Relatório de teste salvo com sucesso!');
        console.log('🔍 Verifique as Issues do GitHub para confirmar');
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
    }
}

// === ATUALIZAR LISTA DE FUNÇÕES ===
console.log('=== FUNÇÕES DE DEBUG DISPONÍVEIS ===');
console.log('limparTudo() - Limpa localStorage e recarrega');
console.log('criarRelatórioTeste() - Cria um relatório de teste');
console.log('verificarBotões() - Mostra estado atual dos botões');
console.log('forçarAtualizaçãoBotões() - Força atualização dos botões');
console.log('testarConfigGitHub() - Verifica configuração do GitHub');
console.log('testarConexãoGitHub() - Testa conexão com GitHub');
console.log('carregarRelatóriosGitHub() - Carrega relatórios do GitHub');
console.log('testarSalvamentoGitHub() - Testa salvamento no GitHub');
