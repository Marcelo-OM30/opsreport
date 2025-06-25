// A configuração do GitHub agora está no arquivo config.js
// Certifique-se de que o config.js está carregado antes deste script

// Estado da aplicação
let tarefas = [];
let reports = [];

// Elementos do DOM
const form = document.getElementById('reportForm');
const criticidadeSlider = document.getElementById('criticidade');
const criticidadeValue = document.getElementById('criticidadeValue');
const criticidadeLabel = document.getElementById('criticidadeLabel');
const novaTarefaInput = document.getElementById('novaTarefa');
const adicionarTarefaBtn = document.getElementById('adicionarTarefa');
const tarefasLista = document.getElementById('tarefasLista');
const limparFormBtn = document.getElementById('limparForm');
const reportsContainer = document.getElementById('reportsContainer');
const loadingReports = document.getElementById('loadingReports');
const exportExcelBtn = document.getElementById('exportExcel');
const exportWordBtn = document.getElementById('exportWord');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar a configuração ser carregada
    waitForConfig().then(() => {
        console.log('✅ Configuração carregada:', {
            hasToken: !!window.CONFIG.GITHUB_TOKEN,
            repo: window.CONFIG.GITHUB_REPO,
            tokenLength: window.CONFIG.GITHUB_TOKEN ? window.CONFIG.GITHUB_TOKEN.length : 0,
            teamsEnabled: window.CONFIG.TEAMS_ENABLED,
            teamsWebhook: !!window.CONFIG.TEAMS_WEBHOOK_URL,
            teamsSendOnCreate: window.CONFIG.TEAMS_CONFIG?.sendOnCreate
        });
        
        // 🔍 DEBUG ESPECÍFICO DO TEAMS
        if (window.CONFIG.TEAMS_ENABLED) {
            console.log('📢 Teams está HABILITADO');
            if (window.CONFIG.TEAMS_WEBHOOK_URL) {
                console.log('📢 Webhook configurado:', window.CONFIG.TEAMS_WEBHOOK_URL.substring(0, 50) + '...');
            } else {
                console.log('❌ Webhook não configurado');
            }
        } else {
            console.log('❌ Teams está DESABILITADO');
        }
        
        initializeApp();
    }).catch((error) => {
        console.warn('⚠️ Erro ao carregar configuração, usando padrão:', error);
        
        // Configuração padrão em caso de erro
        window.CONFIG = {
            GITHUB_TOKEN: null,
            GITHUB_REPO: 'usuario/repositorio',
            DEBUG_MODE: true,
            TEAM_MEMBERS: ['Local User'],
            TEAMS_ENABLED: false,
            TEAMS_WEBHOOK_URL: null,
            TEAMS_CONFIG: {
                sendOnCreate: true,
                sendSummary: true,
                mentionTeam: false,
                includeDetails: true
            }
        };
        
        window.GITHUB_CONFIG = {
            owner: '',
            repo: '',
            token: null
        };
        
        showToast('⚠️ Sistema funcionando em modo local (configuração padrão)', 'warning');
        initializeApp();
    });
});

function initializeApp() {
    setupEventListeners();
    updateCriticidadeDisplay();
    loadReports(); // loadReports já vai definir o estado correto dos botões
    
    // Verificação adicional após um pequeno delay para garantir que tudo está correto
    setTimeout(() => {
        const reports = JSON.parse(localStorage.getItem('opsReports') || '[]');
        updateExportButtons(reports.length > 0);
    }, 200);
}

function setupEventListeners() {
    // Slider de criticidade
    criticidadeSlider.addEventListener('input', updateCriticidadeDisplay);
    
    // Botão adicionar tarefa
    adicionarTarefaBtn.addEventListener('click', adicionarTarefa);
    
    // Enter na input de tarefa
    novaTarefaInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            adicionarTarefa();
        }
    });
    
    // Botão limpar formulário
    limparFormBtn.addEventListener('click', limparFormulario);
    
    // Submit do formulário
    form.addEventListener('submit', handleFormSubmit);
    
    // Botões de exportação
    exportExcelBtn.addEventListener('click', exportarExcel);
    exportWordBtn.addEventListener('click', exportarWord);
    
    // Botão demo temporário
    const createDemoBtn = document.getElementById('createDemoReport');
    if (createDemoBtn) {
        createDemoBtn.addEventListener('click', createDemoReport);
    }
    
    // Botão demo temporário
    const demoBtn = document.getElementById('createDemoReport');
    if (demoBtn) {
        demoBtn.addEventListener('click', createDemoReport);
    }
    
    // Modal de configuração GitHub
    setupConfigModal();
}

function updateCriticidadeDisplay() {
    const valor = parseInt(criticidadeSlider.value);
    criticidadeValue.textContent = valor;
    
    let label = '';
    let color = '';
    
    if (valor <= 3) {
        label = 'Baixa';
        color = '#10b981';
    } else if (valor <= 6) {
        label = 'Média';
        color = '#f59e0b';
    } else {
        label = 'Alta';
        color = '#ef4444';
    }
    
    criticidadeLabel.textContent = label;
    criticidadeValue.style.color = color;
}

function adicionarTarefa() {
    const texto = novaTarefaInput.value.trim();
    
    if (!texto) {
        showToast('Por favor, digite uma tarefa.', 'warning');
        return;
    }
    
    const tarefa = {
        id: Date.now(),
        texto: texto,
        timestamp: new Date().toLocaleString('pt-BR')
    };
    
    tarefas.push(tarefa);
    renderTarefas();
    novaTarefaInput.value = '';
    novaTarefaInput.focus();
}

function removerTarefa(id) {
    tarefas = tarefas.filter(tarefa => tarefa.id !== id);
    renderTarefas();
}

function renderTarefas() {
    if (tarefas.length === 0) {
        tarefasLista.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Nenhuma tarefa adicionada ainda.</p>';
        return;
    }
    
    const html = tarefas.map(tarefa => `
        <div class="tarefa-item">
            <div class="tarefa-texto">${escapeHtml(tarefa.texto)}</div>
            <button type="button" class="btn-remove-task" onclick="removerTarefa(${tarefa.id})">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');
    
    tarefasLista.innerHTML = html;
}

function limparFormulario() {
    if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
        form.reset();
        tarefas = [];
        renderTarefas();
        updateCriticidadeDisplay();
        showToast('Formulário limpo com sucesso!', 'success');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validações
    if (!data.prefeitura || !data.opsInfo || !data.versaoSistema || !data.ambiente || !data.conclusao) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Criar objeto do relatório
    const relatorio = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        timestampBR: new Date().toLocaleString('pt-BR'),
        prefeitura: data.prefeitura,
        opsInfo: data.opsInfo,
        versaoSistema: data.versaoSistema,
        ambiente: data.ambiente,
        erros: data.erros || 'Nenhum erro reportado',
        criticidade: parseInt(data.criticidade),
        tarefas: [...tarefas],
        avaliacaoQA: data.avaliacaoQA || 'Não informado',
        conclusao: data.conclusao
    };
    
    try {
        showToast('Salvando relatório...', 'warning');
        await salvarRelatorio(relatorio);
        showToast('Relatório salvo com sucesso!', 'success');
        
        // Limpar formulário após salvar
        limparFormulario();
        
        // Recarregar relatórios
        loadReports();
        
    } catch (error) {
        console.error('Erro ao salvar relatório:', error);
        
        // Verificar se salvou localmente pelo menos
        const relatoriosLocais = JSON.parse(localStorage.getItem('opsReports') || '[]');
        const salvouLocal = relatoriosLocais.some(r => r.id === relatorio.id);
        
        if (salvouLocal) {
            showToast('Relatório salvo localmente (erro no GitHub)', 'warning');
            // Limpar formulário mesmo com erro no GitHub
            limparFormulario();
            loadReports();
        } else {
            showToast('Erro ao salvar relatório. Tente novamente.', 'error');
        }
    }
}

async function salvarRelatorio(relatorio) {
    console.log('🔍 === INICIANDO SALVAMENTO DE RELATÓRIO ===');
    console.log('Relatório:', relatorio.prefeitura, '-', relatorio.opsInfo);
    console.log('window.CONFIG.TEAMS_ENABLED:', window.CONFIG.TEAMS_ENABLED);
    console.log('window.CONFIG.TEAMS_WEBHOOK_URL existe:', !!window.CONFIG.TEAMS_WEBHOOK_URL);
    console.log('window.CONFIG.TEAMS_CONFIG.sendOnCreate:', window.CONFIG.TEAMS_CONFIG?.sendOnCreate);
    console.log('Token GitHub configurado:', window.CONFIG.GITHUB_TOKEN ? 'Sim' : 'Não');
    
    // Se não tiver token configurado, salvar localmente
    if (!window.CONFIG.GITHUB_TOKEN || 
        window.CONFIG.GITHUB_TOKEN === 'SEU_TOKEN_AQUI' ||
        window.CONFIG.GITHUB_TOKEN === 'SEU_NOVO_TOKEN_AQUI') {
        console.log('Salvando apenas localmente - token não configurado');
        salvarRelatorioLocal(relatorio);
        
        // 🎯 ENVIAR PARA TEAMS MESMO SEM GITHUB
        if (window.CONFIG.TEAMS_ENABLED && window.CONFIG.TEAMS_CONFIG.sendOnCreate) {
            try {
                console.log('Enviando para Teams (modo local)...');
                await enviarParaTeams(relatorio, 'novo');
            } catch (teamsError) {
                console.warn('Erro ao enviar para Teams:', teamsError);
            }
        }
        
        return;
    }
    
    try {
        console.log('Tentando salvar no GitHub...');
        // Extrair owner e repo do formato 'owner/repo'
        const [owner, repo] = window.CONFIG.GITHUB_REPO.split('/');
        
        // Criar issue no GitHub
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${window.CONFIG.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: `Relatório - ${relatorio.prefeitura} (${relatorio.ambiente}) - ${relatorio.timestampBR}`,
                body: formatarRelatorioParaGitHub(relatorio),
                labels: [
                    'relatório',
                    relatorio.ambiente,
                    relatorio.conclusao,
                    `criticidade-${relatorio.criticidade}`
                ]
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', response.status, errorText);
            throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Issue criada com sucesso:', result.html_url);
        relatorio.githubUrl = result.html_url;
        
        // Também salvar localmente como backup
        salvarRelatorioLocal(relatorio);
        
        // Enviar para Teams se configurado
        if (window.CONFIG.TEAMS_ENABLED && window.CONFIG.TEAMS_CONFIG.sendOnCreate) {
            try {
                await enviarParaTeams(relatorio, 'novo');
            } catch (teamsError) {
                console.warn('Erro ao enviar para Teams (não crítico):', teamsError);
                // Não interrompe o fluxo se o Teams falhar
            }
        }
        
    } catch (error) {
        console.error('Erro ao salvar no GitHub:', error);
        // Fallback para salvamento local
        salvarRelatorioLocal(relatorio);
        
        // Tentar enviar para Teams mesmo com falha no GitHub
        if (window.CONFIG.TEAMS_ENABLED && window.CONFIG.TEAMS_CONFIG.sendOnCreate) {
            try {
                await enviarParaTeams(relatorio, 'novo');
                console.log('Relatório enviado para Teams apesar do erro no GitHub');
            } catch (teamsError) {
                console.warn('Erro ao enviar para Teams:', teamsError);
            }
        }
        
        throw error; // Re-throw para mostrar o erro na UI
    }
}

function salvarRelatorioLocal(relatorio) {
    let relatorios = JSON.parse(localStorage.getItem('opsReports') || '[]');
    relatorios.unshift(relatorio); // Adicionar no início
    
    // Manter apenas os últimos 50 relatórios
    if (relatorios.length > 50) {
        relatorios = relatorios.slice(0, 50);
    }
    
    localStorage.setItem('opsReports', JSON.stringify(relatorios));
}

function formatarRelatorioParaGitHub(relatorio) {
    const criticidadesLabels = ['', 'Baixa', 'Baixa', 'Baixa', 'Média', 'Média', 'Média', 'Alta', 'Alta', 'Alta', 'Crítica'];
    
    return `
## 📋 Relatório de Operações

**🏷️ Ops:** ${relatorio.opsInfo || 'Não informada'}  
**🔢 Versão:** ${relatorio.versaoSistema || 'Não informada'}  
**📍 Prefeitura:** ${relatorio.prefeitura}  
**🌐 Ambiente:** ${relatorio.ambiente}  
**📅 Data/Hora:** ${relatorio.timestampBR}  
**⚠️ Criticidade:** ${relatorio.criticidade}/10 (${criticidadesLabels[relatorio.criticidade]})  
**✅ Status:** ${relatorio.conclusao === 'aprovado' ? '✅ Aprovado' : '❌ Recusado'}

### 🐛 Erros Reportados
${relatorio.erros}

### 📝 Tarefas Executadas
${relatorio.tarefas.length > 0 ? 
    relatorio.tarefas.map((tarefa, index) => `${index + 1}. ${tarefa.texto}`).join('\n') : 
    'Nenhuma tarefa específica reportada.'}

### 🔍 Avaliação QA
${relatorio.avaliacaoQA}

---
*Relatório gerado automaticamente pelo Sistema de Relatório de Operações*
    `.trim();
}

async function loadReports() {
    try {
        loadingReports.style.display = 'block';
        
        let allReports = [];
        
        // 1. Tentar carregar relatórios do GitHub (públicos para toda equipe)
        try {
            const githubReports = await loadReportsFromGitHub();
            allReports = allReports.concat(githubReports);
        } catch (error) {
            console.log('Não foi possível carregar relatórios do GitHub:', error.message);
        }
        
        // 2. Carregar relatórios locais como backup/cache
        const localReports = JSON.parse(localStorage.getItem('opsReports') || '[]');
        
        // 3. Combinar e remover duplicatas (priorizar GitHub)
        const githubIds = allReports.map(r => r.id);
        const uniqueLocalReports = localReports.filter(r => !githubIds.includes(r.id));
        allReports = allReports.concat(uniqueLocalReports);
        
        // 4. Ordenar por data (mais recentes primeiro)
        allReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (allReports.length === 0) {
            reportsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Nenhum relatório encontrado ainda.</p>';
            updateExportButtons(false);
            return;
        }
        
        renderReports(allReports);
        updateExportButtons(true);
        
    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        reportsContainer.innerHTML = '<p style="text-align: center; color: var(--danger-color); padding: 40px;">Erro ao carregar relatórios.</p>';
        updateExportButtons(false);
    } finally {
        loadingReports.style.display = 'none';
    }
}

function renderReports(reports) {
    if (reports.length === 0) {
        reportsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Nenhum relatório encontrado.</p>';
        return;
    }
    
    const html = reports.map(report => `
        <div class="report-card">
            <div class="report-header">
                <div class="report-title">
                    ${escapeHtml(report.opsInfo || 'Ops não informada')}
                    ${report.author ? `<small style="color: var(--text-secondary); font-weight: normal;"> • por ${report.author}</small>` : ''}
                </div>
                <div class="report-status status-${report.conclusao}">
                    ${report.conclusao === 'aprovado' ? '✅ Aprovado' : '❌ Recusado'}
                </div>
            </div>
            <div class="report-meta">
                <div><strong>Versão:</strong> ${escapeHtml(report.versaoSistema || 'Não informada')}</div>
                <div><strong>Prefeitura:</strong> ${escapeHtml(report.prefeitura)}</div>
                <div><strong>Ambiente:</strong> ${escapeHtml(report.ambiente)}</div>
                <div><strong>Data:</strong> ${report.timestampBR}</div>
                <div><strong>Criticidade:</strong> ${report.criticidade}/10</div>
                ${report.githubUrl ? `<div><strong>GitHub:</strong> <a href="${report.githubUrl}" target="_blank">Ver Issue #${report.githubNumber}</a></div>` : ''}
            </div>
            <div class="report-content">
                ${report.erros !== 'Nenhum erro reportado' ? `<div class="report-section"><strong>Erros:</strong> ${escapeHtml(report.erros)}</div>` : ''}
                ${report.tarefas.length > 0 ? `
                    <div class="report-section">
                        <strong>Tarefas (${report.tarefas.length}):</strong>
                        <ul>
                            ${report.tarefas.map(tarefa => `<li>${escapeHtml(tarefa.texto)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${report.avaliacaoQA !== 'Não informado' ? `<div class="report-section"><strong>Avaliação QA:</strong> ${escapeHtml(report.avaliacaoQA)}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    reportsContainer.innerHTML = html;
}

function updateExportButtons(hasReports) {
    // Aguardar um pouco para garantir que os elementos estão no DOM
    setTimeout(() => {
        const excelBtn = document.getElementById('exportExcel');
        const wordBtn = document.getElementById('exportWord');
        
        if (!hasReports) {
            excelBtn.title = 'Nenhum relatório disponível para exportar';
            wordBtn.title = 'Nenhum relatório disponível para exportar';
            excelBtn.innerHTML = '<i class="fas fa-file-excel"></i> Exportar Excel';
            wordBtn.innerHTML = '<i class="fas fa-file-word"></i> Exportar Word';
        } else {
            excelBtn.title = 'Exportar todos os relatórios para Excel';
            wordBtn.title = 'Exportar todos os relatórios para Word';
            // Sempre mantém o texto padrão quando há relatórios (exceto durante processamento)
            if (!excelBtn.innerHTML.includes('fa-spin')) {
                excelBtn.innerHTML = '<i class="fas fa-file-excel"></i> Exportar Excel';
            }
            if (!wordBtn.innerHTML.includes('fa-spin')) {
                wordBtn.innerHTML = '<i class="fas fa-file-word"></i> Exportar Word';
            }
        }
    }, 100);
}

// Funções de Exportação
async function exportarExcel() {
    const exportBtn = document.getElementById('exportExcel');
    
    try {
        // Indicador visual de processamento
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exportando...';
        exportBtn.disabled = true;
        
        const relatorios = await getAllReportsForExport();
        
        if (relatorios.length === 0) {
            showToast('Nenhum relatório encontrado para exportar.', 'warning');
            // Restaurar botão imediatamente se não há relatórios
            setTimeout(() => {
                const excelBtn = document.getElementById('exportExcel');
                if (excelBtn) {
                    excelBtn.innerHTML = '<i class="fas fa-file-excel"></i> Exportar Excel';
                    excelBtn.disabled = true;
                }
            }, 100);
            return;
        }
        
        // Preparar dados para Excel
        const dadosExcel = relatorios.map(relatorio => ({
            'Data/Hora': relatorio.timestampBR,
            'Nome da Ops': relatorio.opsInfo || 'Não informada',
            'Versão': relatorio.versaoSistema || 'Não informada',
            'Prefeitura': relatorio.prefeitura,
            'Ambiente': relatorio.ambiente,
            'Criticidade': `${relatorio.criticidade}/10`,
            'Status': relatorio.conclusao === 'aprovado' ? 'Aprovado' : 'Recusado',
            'Tarefas': relatorio.tarefas.length,
            'Autor': relatorio.author || 'Local',
            'Erros': relatorio.erros === 'Nenhum erro reportado' ? 'Nenhum' : relatorio.erros.substring(0, 100) + (relatorio.erros.length > 100 ? '...' : ''),
            'Avaliação QA': relatorio.avaliacaoQA === 'Não informado' ? 'Não informado' : relatorio.avaliacaoQA.substring(0, 100) + (relatorio.avaliacaoQA.length > 100 ? '...' : '')
        }));
        
        // Criar workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dadosExcel);
        
        // Ajustar largura das colunas
        const columnWidths = [
            { wch: 18 }, // Data/Hora
            { wch: 25 }, // Nome da Ops
            { wch: 15 }, // Versão
            { wch: 15 }, // Prefeitura
            { wch: 12 }, // Ambiente
            { wch: 12 }, // Criticidade
            { wch: 10 }, // Status
            { wch: 8 },  // Tarefas
            { wch: 15 }, // Autor
            { wch: 30 }, // Erros
            { wch: 30 }  // Avaliação QA
        ];
        ws['!cols'] = columnWidths;
        
        XLSX.utils.book_append_sheet(wb, ws, 'Relatórios');
        
        // Gerar arquivo
        const nomeArquivo = `relatorios_operacoes_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, nomeArquivo);
        
        showToast(`Arquivo Excel exportado: ${nomeArquivo}`, 'success');
        
    } catch (error) {
        console.error('Erro ao exportar Excel:', error);
        showToast('Erro ao exportar arquivo Excel.', 'error');
    } finally {
        // Restaurar botão após um pequeno delay
        setTimeout(() => {
            const relatorios = JSON.parse(localStorage.getItem('opsReports') || '[]');
            const hasReports = relatorios.length > 0;
            
            const excelBtn = document.getElementById('exportExcel');
            if (excelBtn) {
                excelBtn.innerHTML = '<i class="fas fa-file-excel"></i> Exportar Excel';
                excelBtn.disabled = !hasReports; // Só desabilita se não há relatórios
            }
        }, 500);
    }
}

async function exportarWord() {
    const exportBtn = document.getElementById('exportWord');
    
    try {
        // Indicador visual de processamento
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exportando...';
        exportBtn.disabled = true;
        
        const relatorios = await getAllReportsForExport();
        
        if (relatorios.length === 0) {
            showToast('Nenhum relatório encontrado para exportar.', 'warning');
            // Restaurar botão imediatamente se não há relatórios
            setTimeout(() => {
                const wordBtn = document.getElementById('exportWord');
                if (wordBtn) {
                    wordBtn.innerHTML = '<i class="fas fa-file-word"></i> Exportar Word';
                    wordBtn.disabled = true;
                }
            }, 100);
            return;
        }
        
        // Gerar conteúdo HTML para Word
        let htmlContent = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Relatórios de Operações</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #3b82f6; text-align: center; }
                    .relatorio { border: 1px solid #ddd; margin: 20px 0; padding: 15px; border-radius: 5px; }
                    .header { background: #f8f9fa; padding: 10px; margin: -15px -15px 15px -15px; }
                    .titulo { font-size: 18px; font-weight: bold; color: #333; }
                    .status-aprovado { color: #10b981; }
                    .status-recusado { color: #ef4444; }
                    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
                    .campo { margin: 5px 0; }
                    .label { font-weight: bold; }
                    .tarefas { margin: 10px 0; }
                    .tarefa-item { margin: 5px 0; padding-left: 20px; }
                </style>
            </head>
            <body>
                <h1>📋 Relatórios de Operações</h1>
                <p><strong>Data de Exportação:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <p><strong>Total de Relatórios:</strong> ${relatorios.length}</p>
                <hr>
        `;
        
        relatorios.forEach((relatorio, index) => {
            const criticidadeLabel = relatorio.criticidade <= 3 ? 'Baixa' : 
                                   relatorio.criticidade <= 6 ? 'Média' : 'Alta';
            
            htmlContent += `
                <div class="relatorio">
                    <div class="header">
                        <div class="titulo">${relatorio.opsInfo || 'Ops não informada'}</div>
                        <div class="status-${relatorio.conclusao}">
                            ${relatorio.conclusao === 'aprovado' ? '✅ Aprovado' : '❌ Recusado'}
                        </div>
                    </div>
                    
                    <div class="meta">
                        <div class="campo">
                            <span class="label">Versão:</span> ${relatorio.versaoSistema || 'Não informada'}
                        </div>
                        <div class="campo">
                            <span class="label">Prefeitura:</span> ${relatorio.prefeitura}
                        </div>
                        <div class="campo">
                            <span class="label">Ambiente:</span> ${relatorio.ambiente}
                        </div>
                        <div class="campo">
                            <span class="label">Data:</span> ${relatorio.timestampBR}
                        </div>
                        <div class="campo">
                            <span class="label">Criticidade:</span> ${relatorio.criticidade}/10 (${criticidadeLabel})
                        </div>
                        <div class="campo">
                            <span class="label">Total de Tarefas:</span> ${relatorio.tarefas.length}
                        </div>
                        ${relatorio.author ? `
                        <div class="campo">
                            <span class="label">Autor:</span> ${relatorio.author}
                        </div>
                        ` : ''}
                    </div>
                    
                    ${relatorio.erros !== 'Nenhum erro reportado' ? `
                        <div class="campo">
                            <span class="label">Erros Reportados:</span><br>
                            ${relatorio.erros}
                        </div>
                    ` : ''}
                    
                    ${relatorio.tarefas.length > 0 ? `
                        <div class="tarefas">
                            <span class="label">Tarefas Executadas:</span>
                            ${relatorio.tarefas.map((tarefa, i) => `
                                <div class="tarefa-item">${i + 1}. ${tarefa.texto}</div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${relatorio.avaliacaoQA !== 'Não informado' ? `
                        <div class="campo">
                            <span class="label">Avaliação QA:</span><br>
                            ${relatorio.avaliacaoQA}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        htmlContent += `
            </body>
            </html>
        `;
        
        // Criar blob e fazer download
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const nomeArquivo = `relatorios_operacoes_${new Date().toISOString().split('T')[0]}.doc`;
        
        if (window.saveAs) {
            saveAs(blob, nomeArquivo);
        } else {
            // Fallback para navegadores sem FileSaver
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nomeArquivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        showToast(`Arquivo Word exportado: ${nomeArquivo}`, 'success');
        
    } catch (error) {
        console.error('Erro ao exportar Word:', error);
        showToast('Erro ao exportar arquivo Word.', 'error');
    } finally {
        // Restaurar botão após um pequeno delay
        setTimeout(() => {
            const relatorios = JSON.parse(localStorage.getItem('opsReports') || '[]');
            const hasReports = relatorios.length > 0;
            
            const wordBtn = document.getElementById('exportWord');
            if (wordBtn) {
                wordBtn.innerHTML = '<i class="fas fa-file-word"></i> Exportar Word';
                wordBtn.disabled = !hasReports; // Só desabilita se não há relatórios
            }
        }, 500);
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    
    // Limpar timers anteriores
    if (toast.hideTimer) {
        clearTimeout(toast.hideTimer);
    }
    
    // Remover classes anteriores
    toast.className = 'toast';
    
    // Definir ícone baseado no tipo
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    toast.innerHTML = `${icon} ${message}`;
    toast.classList.add(type, 'show');
    
    // Remover após 4 segundos com referência para poder cancelar
    toast.hideTimer = setTimeout(() => {
        toast.classList.remove('show');
        toast.hideTimer = null;
    }, 4000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para limpar dados antigos (executar ocasionalmente)
function limparDadosAntigos() {
    const relatorios = JSON.parse(localStorage.getItem('opsReports') || '[]');
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    
    const relatoriosFiltrados = relatorios.filter(relatorio => {
        const dataRelatorio = new Date(relatorio.timestamp);
        return dataRelatorio > trintaDiasAtras;
    });
    
    localStorage.setItem('opsReports', JSON.stringify(relatoriosFiltrados));
}

// Executar limpeza ocasionalmente
if (Math.random() < 0.1) { // 10% de chance
    limparDadosAntigos();
}

// Função para criar relatório de demonstração (temporária)
function createDemoReport() {
    const demoReport = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        timestampBR: new Date().toLocaleString('pt-BR'),
        prefeitura: ['jahu', 'caieiras', 'cotia', 'aruja'][Math.floor(Math.random() * 4)],
        opsInfo: `OPS-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}-DEMO`,
        versaoSistema: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
        ambiente: Math.random() > 0.5 ? 'producao' : 'homologacao',
        erros: Math.random() > 0.7 ? 'Nenhum erro reportado' : 'Erro de demonstração encontrado durante o deploy',
        criticidade: Math.floor(Math.random() * 10) + 1,
        tarefas: [
            { id: 1, texto: 'Deploy da aplicação', timestamp: new Date().toLocaleString('pt-BR') },
            { id: 2, texto: 'Verificação de logs', timestamp: new Date().toLocaleString('pt-BR') },
            { id: 3, texto: 'Teste de funcionalidades', timestamp: new Date().toLocaleString('pt-BR') }
        ],
        avaliacaoQA: 'Relatório de demonstração criado automaticamente',
        conclusao: Math.random() > 0.3 ? 'aprovado' : 'recusado'
    };
    
    salvarRelatorioLocal(demoReport);
    loadReports();
    showToast('Relatório de demonstração criado!', 'success');
}

async function loadReportsFromGitHub() {
    // Verificar se há configuração válida do GitHub
    if (!window.CONFIG.GITHUB_REPO || window.CONFIG.GITHUB_REPO === 'usuario/repositorio') {
        throw new Error('Configuração do GitHub não definida');
    }
    
    // Extrair owner e repo do formato 'owner/repo'
    const [owner, repo] = window.CONFIG.GITHUB_REPO.split('/');
    
    if (!owner || !repo) {
        throw new Error('Formato de repositório inválido. Use: owner/repo');
    }
    
    // Buscar Issues do repositório (não precisa de token para leitura de repos públicos)
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?labels=relatório&state=all&per_page=100`);
    
    if (!response.ok) {
        throw new Error(`Erro ao carregar do GitHub: ${response.status}`);
    }
    
    const issues = await response.json();
    
    // Converter Issues para formato de relatório
    const reports = issues.map(issue => {
        try {
            // Extrair dados do corpo da issue
            const body = issue.body || '';
            
            // Extrair informações usando regex
            const opsMatch = body.match(/\*\*🏷️ Ops:\*\* (.+)/);
            const versaoMatch = body.match(/\*\*🔢 Versão:\*\* (.+)/);
            const prefeituraMatch = body.match(/\*\*📍 Prefeitura:\*\* (.+)/);
            const ambienteMatch = body.match(/\*\*🌐 Ambiente:\*\* (.+)/);
            const dataMatch = body.match(/\*\*📅 Data\/Hora:\*\* (.+)/);
            const criticidadeMatch = body.match(/\*\*⚠️ Criticidade:\*\* (\d+)\/10/);
            const statusMatch = body.match(/\*\*✅ Status:\*\* (.+)/);
            
            // Extrair seções
            const errosMatch = body.match(/### 🐛 Erros Reportados\s*\n(.+?)(?=\n###|\n---|\n\*|$)/s);
            const tarefasMatch = body.match(/### 📝 Tarefas Executadas\s*\n(.+?)(?=\n###|\n---|\n\*|$)/s);
            const qaMatch = body.match(/### 🔍 Avaliação QA\s*\n(.+?)(?=\n###|\n---|\n\*|$)/s);
            
            // Processar tarefas
            let tarefas = [];
            if (tarefasMatch && tarefasMatch[1] && !tarefasMatch[1].includes('Nenhuma tarefa')) {
                const tarefasText = tarefasMatch[1].trim();
                tarefas = tarefasText.split('\n').map((linha, index) => {
                    const texto = linha.replace(/^\d+\.\s*/, '').trim();
                    return {
                        id: index + 1,
                        texto: texto,
                        timestamp: dataMatch ? dataMatch[1].trim() : new Date().toLocaleString('pt-BR')
                    };
                }).filter(t => t.texto);
            }
            
            return {
                id: `github-${issue.number}`, // ID único do GitHub
                timestamp: issue.created_at,
                timestampBR: new Date(issue.created_at).toLocaleString('pt-BR'),
                prefeitura: prefeituraMatch ? prefeituraMatch[1].trim() : 'Não informada',
                opsInfo: opsMatch ? opsMatch[1].trim() : 'Não informada',
                versaoSistema: versaoMatch ? versaoMatch[1].trim() : 'Não informada',
                ambiente: ambienteMatch ? ambienteMatch[1].trim() : 'Não informado',
                erros: errosMatch ? errosMatch[1].trim() : 'Nenhum erro reportado',
                criticidade: criticidadeMatch ? parseInt(criticidadeMatch[1]) : 5,
                tarefas: tarefas,
                avaliacaoQA: qaMatch ? qaMatch[1].trim() : 'Não informado',
                conclusao: statusMatch && statusMatch[1].includes('Aprovado') ? 'aprovado' : 'recusado',
                githubUrl: issue.html_url,
                githubNumber: issue.number,
                author: issue.user.login,
                createdAt: issue.created_at
            };
        } catch (error) {
            console.error('Erro ao processar issue:', issue.number, error);
            return null;
        }
    }).filter(report => report !== null);
    
    return reports;
}

async function getAllReportsForExport() {
    try {
        // Carregar todos os relatórios (GitHub + local)
        let allReports = [];
        
        // GitHub reports
        try {
            const githubReports = await loadReportsFromGitHub();
            allReports = allReports.concat(githubReports);
        } catch (error) {
            console.log('GitHub reports not available for export');
        }
        
        // Local reports
        const localReports = JSON.parse(localStorage.getItem('opsReports') || '[]');
        const githubIds = allReports.map(r => r.id);
        const uniqueLocalReports = localReports.filter(r => !githubIds.includes(r.id));
        allReports = allReports.concat(uniqueLocalReports);
        
        // Ordenar por data
        allReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return allReports;
    } catch (error) {
        console.error('Erro ao carregar relatórios para exportação:', error);
        // Fallback para relatórios locais
        return JSON.parse(localStorage.getItem('opsReports') || '[]');
    }
}

// === CONFIGURAÇÃO DINÂMICA DO GITHUB ===

function setupConfigModal() {
    const configBtn = document.getElementById('configGitHub');
    const modal = document.getElementById('configModal');
    const closeBtn = document.getElementById('closeModal');
    const saveBtn = document.getElementById('saveConfig');
    const clearBtn = document.getElementById('clearConfig');
    const localBtn = document.getElementById('useLocal');
    
    // Abrir modal
    if (configBtn) {
        configBtn.addEventListener('click', () => {
            loadCurrentConfig();
            modal.style.display = 'flex';
        });
    }
    
    // Fechar modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Salvar configuração
    if (saveBtn) {
        saveBtn.addEventListener('click', saveGitHubConfig);
    }
    
    // Limpar configuração
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar a configuração do GitHub?')) {
                clearGitHubConfig();
            }
        });
    }
    
    // Usar modo local
    if (localBtn) {
        localBtn.addEventListener('click', () => {
            clearGitHubConfig();
        });
    }
}

function loadCurrentConfig() {
    const tokenInput = document.getElementById('githubToken');
    const repoInput = document.getElementById('githubRepo');
    const teamInput = document.getElementById('teamMembers');
    
    // Carregar configuração atual
    if (window.CONFIG.GITHUB_TOKEN && window.CONFIG.GITHUB_TOKEN !== 'SEU_TOKEN_AQUI') {
        tokenInput.value = window.CONFIG.GITHUB_TOKEN;
    }
    
    if (window.CONFIG.GITHUB_REPO && window.CONFIG.GITHUB_REPO !== 'usuario/repositorio') {
        repoInput.value = window.CONFIG.GITHUB_REPO;
    }
    
    if (window.CONFIG.TEAM_MEMBERS && window.CONFIG.TEAM_MEMBERS.length > 0) {
        teamInput.value = window.CONFIG.TEAM_MEMBERS.join(', ');
    }
    
    // Adicionar botão de compartilhamento se não existir
    if (typeof addShareButton === 'function') {
        addShareButton();
    }
    
    // Mostrar status atual
    showConfigStatus();
}

function saveGitHubConfig() {
    const token = document.getElementById('githubToken').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();
    const teamText = document.getElementById('teamMembers').value.trim();
    const team = teamText.split(',').map(name => name.trim()).filter(name => name);
    
    // Configuração do Teams
    const teamsWebhook = document.getElementById('teamsWebhook').value.trim();
    const teamsEnabled = document.getElementById('teamsEnabled').checked;
    
    // Validações GitHub
    if (!token) {
        showConfigMessage('Por favor, insira um token do GitHub.', 'error');
        return;
    }
    
    if (!repo || !repo.includes('/')) {
        showConfigMessage('Por favor, insira um repositório no formato usuario/repo.', 'error');
        return;
    }
    
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        showConfigMessage('Token parece inválido. Deve começar com ghp_ ou github_pat_', 'error');
        return;
    }
    
    // Validações Teams
    if (teamsEnabled && !teamsWebhook) {
        showConfigMessage('Por favor, insira a URL do webhook do Teams ou desabilite a integração.', 'error');
        return;
    }
    
    if (teamsWebhook && !teamsWebhook.startsWith('https://')) {
        showConfigMessage('URL do Teams deve começar com https://', 'error');
        return;
    }
    
    if (teamsWebhook && !(teamsWebhook.includes('outlook.office.com/webhook') || 
                         teamsWebhook.includes('logic.azure.com') || 
                         teamsWebhook.includes('prod-'))) {
        showConfigMessage('URL do Teams parece inválida. Deve ser um webhook do Teams/Power Automate.', 'warning');
    }
    
    // Salvar configuração
    try {
        // Atualizar configuração temporária
        window.CONFIG.GITHUB_TOKEN = token;
        window.CONFIG.GITHUB_REPO = repo;
        window.CONFIG.TEAM_MEMBERS = team;
        window.CONFIG.TEAMS_WEBHOOK_URL = teamsWebhook;
        window.CONFIG.TEAMS_ENABLED = teamsEnabled;
        
        // Atualizar GITHUB_CONFIG para compatibilidade
        GITHUB_CONFIG.token = token;
        GITHUB_CONFIG.owner = repo.split('/')[0];
        GITHUB_CONFIG.repo = repo.split('/')[1];
        
        const config = { 
            token, 
            repo, 
            team, 
            teamsWebhook, 
            teamsEnabled 
        };
        
        localStorage.setItem('opsReport_config', JSON.stringify(config));
        
        let message = '✅ Configuração salva!';
        if (teamsEnabled) {
            message += ' GitHub + Teams configurados.';
        } else {
            message += ' Apenas GitHub configurado.';
        }
        
        showConfigMessage(message, 'success');
        
        // Dar instruções para salvar permanentemente
        const saveInstructions = `
Configuração salva temporariamente!

Para salvar permanentemente, edite o config.js:
- GITHUB_TOKEN: '${token}'
- GITHUB_REPO: '${repo}'
- TEAMS_WEBHOOK_URL: '${teamsWebhook}'
- TEAMS_ENABLED: ${teamsEnabled}

A configuração funcionará nesta sessão.
        `;
        
        setTimeout(() => {
            if (confirm('Deseja ver as instruções para salvar permanentemente?')) {
                alert(saveInstructions);
            }
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao salvar configuração:', error);
        showConfigMessage('Erro ao salvar configuração.', 'error');
    }
}

function clearGitHubConfig() {
    try {
        if (typeof clearGitHubConfig === 'function') {
            clearGitHubConfig();
        } else {
            // Fallback
            localStorage.removeItem('opsReport_config');
            showConfigMessage('Configuração limpa! A página será recarregada.', 'info');
            setTimeout(() => location.reload(), 2000);
        }
    } catch (error) {
        console.error('Erro ao limpar configuração:', error);
        showConfigMessage('Erro ao limpar configuração.', 'error');
    }
}

function showConfigStatus() {
    const statusDiv = document.getElementById('configStatus');
    const isConfigured = window.CONFIG.GITHUB_TOKEN && 
                        window.CONFIG.GITHUB_TOKEN !== 'SEU_TOKEN_AQUI' &&
                        window.CONFIG.GITHUB_REPO && 
                        window.CONFIG.GITHUB_REPO !== 'usuario/repositorio';
    
    if (isConfigured) {
        showConfigMessage(`✅ GitHub configurado: ${window.CONFIG.GITHUB_REPO}`, 'success');
    } else {
        showConfigMessage('⚠️ Modo local ativo. Configure o GitHub para sincronizar com a equipe.', 'info');
    }
}

function showConfigMessage(message, type) {
    const statusDiv = document.getElementById('configStatus');
    statusDiv.innerHTML = message;
    statusDiv.className = `config-status ${type}`;
    statusDiv.style.display = 'block';
}

// === FUNÇÕES DE DIAGNÓSTICO AVANÇADO ===
async function diagnosticoCompleto() {
    console.log('🔍 === DIAGNÓSTICO COMPLETO DO SISTEMA ===');
    
    // 1. Verificar configuração
    console.log('1️⃣ Verificando configuração...');
    console.log('CONFIG:', {
        hasToken: !!window.CONFIG.GITHUB_TOKEN,
        tokenLength: window.CONFIG.GITHUB_TOKEN ? window.CONFIG.GITHUB_TOKEN.length : 0,
        tokenPrefix: window.CONFIG.GITHUB_TOKEN ? window.CONFIG.GITHUB_TOKEN.substring(0, 4) + '...' : 'N/A',
        repo: window.CONFIG.GITHUB_REPO,
        debugMode: window.CONFIG.DEBUG_MODE
    });
    
    if (!window.CONFIG.GITHUB_TOKEN || window.CONFIG.GITHUB_TOKEN === 'SEU_TOKEN_AQUI') {
        console.log('❌ Token não configurado');
        showToast('Token GitHub não configurado', 'error');
        return;
    }
    
    // 2. Testar autenticação básica
    console.log('2️⃣ Testando autenticação...');
    try {
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${window.CONFIG.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'opsReport-v1.0'
            }
        });
        
        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('✅ Autenticação OK:', userData.login);
            showToast(`Autenticado como: ${userData.login}`, 'success');
        } else {
            const errorData = await userResponse.text();
            console.log('❌ Erro de autenticação:', userResponse.status, errorData);
            showToast(`Erro de autenticação: ${userResponse.status}`, 'error');
            return;
        }
    } catch (error) {
        console.log('❌ Erro de rede:', error);
        showToast('Erro de rede ao testar autenticação', 'error');
        return;
    }
    
    // 3. Testar acesso ao repositório
    console.log('3️⃣ Testando acesso ao repositório...');
    try {
        const [owner, repo] = window.CONFIG.GITHUB_REPO.split('/');
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Authorization': `token ${window.CONFIG.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'opsReport-v1.0'
            }
        });
        
        if (repoResponse.ok) {
            const repoData = await repoResponse.json();
            console.log('✅ Repositório acessível:', repoData.full_name);
            showToast(`Repositório OK: ${repoData.full_name}`, 'success');
        } else {
            const errorData = await repoResponse.text();
            console.log('❌ Erro de acesso ao repositório:', repoResponse.status, errorData);
            showToast(`Erro no repositório: ${repoResponse.status}`, 'error');
            return;
        }
    } catch (error) {
        console.log('❌ Erro ao acessar repositório:', error);
        showToast('Erro ao acessar repositório', 'error');
        return;
    }
    
    // 4. Testar criação de issue (simulação)
    console.log('4️⃣ Testando permissões de escrita...');
    try {
        const [owner, repo] = window.CONFIG.GITHUB_REPO.split('/');
        const testResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${window.CONFIG.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'opsReport-v1.0'
            },
            body: JSON.stringify({
                title: '[TESTE] Diagnóstico do Sistema - ' + new Date().toLocaleString(),
                body: 'Este é um teste automático do sistema de relatórios. Issue criada pelo diagnóstico.',
                labels: ['teste', 'sistema']
            })
        });
        
        if (testResponse.ok) {
            const issueData = await testResponse.json();
            console.log('✅ Permissão de escrita OK - Issue criada:', issueData.number);
            showToast(`Teste OK - Issue #${issueData.number} criada`, 'success');
        } else {
            const errorData = await testResponse.text();
            console.log('❌ Erro de permissão:', testResponse.status, errorData);
            showToast(`Erro de permissão: ${testResponse.status}`, 'error');
        }
    } catch (error) {
        console.log('❌ Erro ao testar permissões:', error);
        showToast('Erro ao testar permissões de escrita', 'error');
    }
    
    console.log('🔍 === DIAGNÓSTICO COMPLETO ===');
}

async function testarNovoToken() {
    const novoToken = prompt('Cole o novo token do GitHub:');
    if (!novoToken) return;
    
    console.log('🔍 Testando novo token...');
    
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${novoToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'opsReport-v1.0'
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            console.log('✅ Novo token válido para:', userData.login);
            showToast(`Token válido para: ${userData.login}`, 'success');
            
            if (confirm('Token válido! Deseja salvar esta configuração?')) {
                // Atualizar configuração temporariamente
                window.CONFIG.GITHUB_TOKEN = novoToken;
                showToast('Token atualizado temporariamente. Atualize o config.js para salvar permanentemente.', 'info');
            }
        } else {
            const errorData = await response.text();
            console.log('❌ Token inválido:', response.status, errorData);
            showToast(`Token inválido: ${response.status}`, 'error');
        }
    } catch (error) {
        console.log('❌ Erro ao testar token:', error);
        showToast('Erro ao testar token', 'error');
    }
}

async function configurarNovoToken() {
    console.log('🔧 === CONFIGURAÇÃO DE NOVO TOKEN ===');
    
    const instructions = `
Para configurar um novo token GitHub:

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Configure:
   - Note: "Sistema de Relatórios OM30"
   - Expiration: 90 days
   - Scopes: ✅ repo (Full control)
4. Copie o token gerado
5. Cole no próximo prompt

⚠️ O token deve começar com "ghp_"
`;
    
    alert(instructions);
    
    const novoToken = prompt('Cole aqui o token GitHub:');
    if (!novoToken) {
        showToast('Configuração cancelada', 'info');
        return;
    }
    
    if (!novoToken.startsWith('ghp_')) {
        showToast('Token inválido! Deve começar com "ghp_"', 'error');
        return;
    }
    
    // Testar o token
    try {
        showToast('Testando token...', 'info');
        
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${novoToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'opsReport-v1.0'
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            console.log('✅ Token válido para usuário:', userData.login);
            
            // Testar acesso ao repositório
            const repoResponse = await fetch('https://api.github.com/repos/Marcelo-OM30/opsreport', {
                headers: {
                    'Authorization': `token ${novoToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'opsReport-v1.0'
                }
            });
            
            if (repoResponse.ok) {
                // Atualizar configuração temporariamente
                window.CONFIG.GITHUB_TOKEN = novoToken;
                GITHUB_CONFIG.token = novoToken;
                
                showToast(`✅ Token configurado para: ${userData.login}`, 'success');
                
                // Dar instruções para salvar permanentemente
                const saveInstructions = `
Token configurado temporariamente!

Para salvar permanentemente:
1. Abra o arquivo config.js
2. Substitua a linha:
   GITHUB_TOKEN: null,
   
   Por:
   GITHUB_TOKEN: '${novoToken}',

3. Salve o arquivo

O token funcionará nesta sessão, mas será perdido ao recarregar a página se não salvar no config.js.
`;
                alert(saveInstructions);
                
                // Recarregar relatórios
                await loadReports();
                
            } else {
                showToast('Token válido, mas sem acesso ao repositório', 'warning');
            }
            
        } else {
            const errorData = await response.text();
            console.log('❌ Token inválido:', response.status, errorData);
            showToast(`Token inválido: ${response.status}`, 'error');
        }
    } catch (error) {
        console.log('❌ Erro ao testar token:', error);
        showToast('Erro ao testar token', 'error');
    }
}

// === INTEGRAÇÃO COM MICROSOFT TEAMS ===
async function enviarParaTeams(relatorio, tipo = 'novo') {
    console.log('🔍 === TENTATIVA DE ENVIO PARA TEAMS ===');
    console.log('TEAMS_ENABLED:', window.CONFIG.TEAMS_ENABLED);
    console.log('TEAMS_WEBHOOK_URL:', window.CONFIG.TEAMS_WEBHOOK_URL ? 'Configurado' : 'Não configurado');
    console.log('sendOnCreate:', window.CONFIG.TEAMS_CONFIG?.sendOnCreate);
    
    if (!window.CONFIG.TEAMS_ENABLED || !window.CONFIG.TEAMS_WEBHOOK_URL) {
        console.log('📢 Teams não configurado ou desabilitado');
        console.log('- TEAMS_ENABLED:', window.CONFIG.TEAMS_ENABLED);
        console.log('- TEAMS_WEBHOOK_URL:', !!window.CONFIG.TEAMS_WEBHOOK_URL);
        return false;
    }
    
    try {
        console.log('📢 Enviando relatório para Teams...');
        console.log('Relatório:', relatorio.prefeitura, '-', relatorio.opsInfo);
        
        const card = criarCardTeams(relatorio, tipo);
        
        const response = await fetch(window.CONFIG.TEAMS_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(card)
        });
        
        if (response.ok) {
            console.log('✅ Relatório enviado para Teams com sucesso');
            showToast('📢 Relatório enviado para Teams!', 'success');
            return true;
        } else {
            console.error('❌ Erro ao enviar para Teams:', response.status);
            showToast('❌ Erro ao enviar para Teams', 'error');
            return false;
        }
    } catch (error) {
        console.error('❌ Erro na integração com Teams:', error);
        showToast('❌ Erro na conexão com Teams', 'error');
        return false;
    }
}

function criarCardTeams(relatorio, tipo) {
    const dataFormatada = new Date(relatorio.timestamp).toLocaleString('pt-BR');
    const criticidadeColor = getCriticidadeColor(relatorio.criticidade);
    const criticidadeText = getCriticidadeText(relatorio.criticidade);
    
    let titulo = '🚀 Novo Relatório de Operação';
    let subtitulo = `${relatorio.prefeitura} - ${relatorio.opsInfo}`;
    
    if (tipo === 'resumo') {
        titulo = '📊 Resumo de Operações';
        subtitulo = `Relatórios do período`;
    }
    
    // Formato para webhooks modernos (Power Automate/Logic Apps)
    const isModernWebhook = window.CONFIG.TEAMS_WEBHOOK_URL && 
                           (window.CONFIG.TEAMS_WEBHOOK_URL.includes('logic.azure.com') || 
                            window.CONFIG.TEAMS_WEBHOOK_URL.includes('prod-'));
    
    if (isModernWebhook) {
        // Formato simplificado para Power Automate
        return {
            text: `${titulo}\n\n` +
                  `🏛️ **Prefeitura:** ${relatorio.prefeitura}\n` +
                  `📋 **Operação:** ${relatorio.opsInfo}\n` +
                  `🔧 **Versão:** ${relatorio.versaoSistema}\n` +
                  `🌐 **Ambiente:** ${relatorio.ambiente}\n` +
                  `⚠️ **Criticidade:** ${criticidadeText} (${relatorio.criticidade}/10)\n` +
                  `👤 **Responsável:** ${relatorio.responsavel || 'Não informado'}\n` +
                  `📅 **Data:** ${dataFormatada}\n\n` +
                  `✅ **Conclusão:** ${relatorio.conclusao}\n\n` +
                  `🔗 [Ver Todos os Relatórios](https://marcelo-om30.github.io/opsreport/)`
        };
    }
    
    // Formato MessageCard para webhooks clássicos
    const card = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": criticidadeColor,
        "summary": titulo,
        "sections": [
            {
                "activityTitle": titulo,
                "activitySubtitle": subtitulo,
                "activityImage": "https://github.com/Marcelo-OM30/opsreport/raw/main/logo.png",
                "facts": [
                    {
                        "name": "🏛️ Prefeitura:",
                        "value": relatorio.prefeitura
                    },
                    {
                        "name": "📋 Operação:",
                        "value": relatorio.opsInfo
                    },
                    {
                        "name": "🔧 Versão:",
                        "value": relatorio.versaoSistema
                    },
                    {
                        "name": "🌐 Ambiente:",
                        "value": relatorio.ambiente
                    },
                    {
                        "name": "⚠️ Criticidade:",
                        "value": `${criticidadeText} (${relatorio.criticidade}/10)`
                    },
                    {
                        "name": "👤 Responsável:",
                        "value": relatorio.responsavel || 'Não informado'
                    },
                    {
                        "name": "📅 Data:",
                        "value": dataFormatada
                    }
                ],
                "markdown": true
            }
        ]
    };
    
    // Adicionar seção de tarefas se houver
    if (relatorio.tarefas && relatorio.tarefas.length > 0) {
        const tarefasText = relatorio.tarefas
            .slice(0, 5) // Limitar a 5 tarefas para não sobrecarregar
            .map((tarefa, index) => `${index + 1}. ${tarefa.texto}`)
            .join('\n');
        
        card.sections.push({
            "activityTitle": "📝 Principais Tarefas",
            "text": tarefasText + (relatorio.tarefas.length > 5 ? `\n... e mais ${relatorio.tarefas.length - 5} tarefas` : '')
        });
    }
    
    // Adicionar conclusão
    if (relatorio.conclusao) {
        card.sections.push({
            "activityTitle": "✅ Conclusão",
            "text": relatorio.conclusao
        });
    }
    
    // Adicionar ações/botões
    card.potentialAction = [
        {
            "@type": "OpenUri",
            "name": "📊 Ver Todos os Relatórios",
            "targets": [
                {
                    "os": "default",
                    "uri": "https://marcelo-om30.github.io/opsreport/"
                }
            ]
        }
    ];
    
    if (window.CONFIG.GITHUB_REPO) {
        card.potentialAction.push({
            "@type": "OpenUri",
            "name": "🔗 Ver no GitHub",
            "targets": [
                {
                    "os": "default",
                    "uri": `https://github.com/${window.CONFIG.GITHUB_REPO}/issues`
                }
            ]
        });
    }
    
    return card;
}

function getCriticidadeColor(criticidade) {
    if (criticidade <= 3) return "#10b981"; // Verde
    if (criticidade <= 6) return "#f59e0b"; // Amarelo
    if (criticidade <= 8) return "#f97316"; // Laranja
    return "#ef4444"; // Vermelho
}

function getCriticidadeText(criticidade) {
    if (criticidade <= 3) return "🟢 Baixa";
    if (criticidade <= 6) return "🟡 Média";
    if (criticidade <= 8) return "🟠 Alta";
    return "🔴 Crítica";
}

async function testarWebhookTeams() {
    if (!window.CONFIG.TEAMS_WEBHOOK_URL) {
        showToast('Configure o webhook do Teams primeiro', 'warning');
        return;
    }
    
    console.log('🧪 === TESTE DETALHADO DO TEAMS ===');
    console.log('URL:', window.CONFIG.TEAMS_WEBHOOK_URL);
    
    // Primeiro, vamos testar com uma mensagem simples
    const mensagemSimples = {
        text: `🧪 TESTE DO SISTEMA - ${new Date().toLocaleString('pt-BR')}\n\nSe você está vendo esta mensagem, a integração está funcionando!\n\nSistema: Relatórios OM30\nHorário: ${new Date().toLocaleString('pt-BR')}`
    };
    
    try {
        showToast('Enviando teste simples para Teams...', 'info');
        console.log('📤 Enviando mensagem simples:', mensagemSimples);
        
        const response = await fetch(window.CONFIG.TEAMS_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mensagemSimples)
        });
        
        console.log('📥 Resposta do Teams:');
        console.log('- Status:', response.status);
        console.log('- Status Text:', response.statusText);
        console.log('- Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('- Body:', responseText);
        
        if (response.ok) {
            console.log('✅ Resposta HTTP OK - Teams deve ter recebido');
            showToast('✅ Teste enviado! Verifique o canal do Teams', 'success');
            
            // Agora testar com card completo
            setTimeout(async () => {
                await testarCardCompleto();
            }, 2000);
            
        } else {
            console.error('❌ Erro na resposta HTTP:', response.status, responseText);
            showToast(`❌ Erro ${response.status}: ${responseText}`, 'error');
            
            // Dar sugestões baseadas no erro
            if (response.status === 400) {
                console.log('💡 Sugestão: Verifique se a URL do webhook está correta');
                showToast('💡 Verifique se a URL do webhook está correta', 'warning');
            } else if (response.status === 404) {
                console.log('💡 Sugestão: O webhook pode ter sido removido ou a URL está errada');
                showToast('💡 Webhook não encontrado. Reconfigure no Teams', 'warning');
            }
        }
    } catch (error) {
        console.error('❌ Erro de rede:', error);
        showToast(`❌ Erro de conexão: ${error.message}`, 'error');
        
        if (error.message.includes('CORS')) {
            console.log('💡 Erro de CORS - isso é normal em desenvolvimento local');
            showToast('💡 Teste no GitHub Pages ou servidor HTTP', 'info');
        }
    }
}

async function testarCardCompleto() {
    console.log('🧪 Testando card completo...');
    
    const relatorioTeste = {
        id: Date.now(),
        prefeitura: 'Teste',
        opsInfo: 'Teste Card Completo - Teams',
        versaoSistema: 'v1.0.0-test',
        ambiente: 'Homologação',
        criticidade: 5,
        responsavel: 'Sistema Automático',
        timestamp: Date.now(),
        tarefas: [
            { id: 1, texto: 'Teste de envio para Teams' },
            { id: 2, texto: 'Verificar formatação do card' }
        ],
        conclusao: 'Este é um teste do card completo. Se você está vendo esta mensagem formatada, a integração está funcionando perfeitamente!'
    };
    
    // Testar diferentes formatos
    const formatos = [
        { nome: 'MessageCard (Clássico)', dados: criarCardTeams(relatorioTeste, 'teste') },
        { nome: 'Texto Formatado', dados: criarMensagemTexto(relatorioTeste) },
        { nome: 'Adaptative Card', dados: criarAdaptiveCard(relatorioTeste) }
    ];
    
    for (const formato of formatos) {
        try {
            console.log(`📤 Testando formato: ${formato.nome}`);
            showToast(`Testando formato: ${formato.nome}`, 'info');
            
            const response = await fetch(window.CONFIG.TEAMS_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formato.dados)
            });
            
            if (response.ok) {
                console.log(`✅ ${formato.nome} enviado com sucesso`);
                showToast(`✅ ${formato.nome} enviado!`, 'success');
            } else {
                console.log(`❌ ${formato.nome} falhou:`, response.status);
            }
            
            // Aguardar entre testes
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.log(`❌ Erro no ${formato.nome}:`, error);
        }
    }
}

function criarMensagemTexto(relatorio) {
    const dataFormatada = new Date(relatorio.timestamp).toLocaleString('pt-BR');
    const criticidadeEmoji = relatorio.criticidade <= 3 ? '🟢' : 
                            relatorio.criticidade <= 6 ? '🟡' : 
                            relatorio.criticidade <= 8 ? '🟠' : '🔴';
    
    return {
        text: `🚀 **NOVO RELATÓRIO DE OPERAÇÃO**

🏛️ **Prefeitura:** ${relatorio.prefeitura}
📋 **Operação:** ${relatorio.opsInfo}
🔧 **Versão:** ${relatorio.versaoSistema}
🌐 **Ambiente:** ${relatorio.ambiente}
${criticidadeEmoji} **Criticidade:** ${relatorio.criticidade}/10

📅 **Data:** ${dataFormatada}
👤 **Responsável:** ${relatorio.responsavel || 'Não informado'}

📝 **Tarefas:**
${relatorio.tarefas.map((t, i) => `${i + 1}. ${t.texto}`).join('\n')}

✅ **Conclusão:**
${relatorio.conclusao}

---
🔗 Ver todos os relatórios: https://marcelo-om30.github.io/opsreport/`
    };
}

function criarAdaptiveCard(relatorio) {
    const dataFormatada = new Date(relatorio.timestamp).toLocaleString('pt-BR');
    
    return {
        type: "message",
        attachments: [
            {
                contentType: "application/vnd.microsoft.card.adaptive",
                content: {
                    type: "AdaptiveCard",
                    version: "1.2",
                    body: [
                        {
                            type: "TextBlock",
                            text: "🚀 Novo Relatório de Operação",
                            weight: "Bolder",
                            size: "Medium"
                        },
                        {
                            type: "FactSet",
                            facts: [
                                { title: "🏛️ Prefeitura:", value: relatorio.prefeitura },
                                { title: "📋 Operação:", value: relatorio.opsInfo },
                                { title: "🔧 Versão:", value: relatorio.versaoSistema },
                                { title: "🌐 Ambiente:", value: relatorio.ambiente },
                                { title: "⚠️ Criticidade:", value: `${relatorio.criticidade}/10` },
                                { title: "📅 Data:", value: dataFormatada }
                            ]
                        },
                        {
                            type: "TextBlock",
                            text: relatorio.conclusao,
                            wrap: true
                        }
                    ],
                    actions: [
                        {
                            type: "Action.OpenUrl",
                            title: "Ver Relatórios",
                            url: "https://marcelo-om30.github.io/opsreport/"
                        }
                    ]
                }
            }
        ]
    };
}

// === DIAGNÓSTICO DETALHADO DO TEAMS ===
function validarWebhookTeams(url) {
    console.log('🔍 Validando URL do Teams:', url);
    
    if (!url) {
        return { valido: false, erro: 'URL não fornecida' };
    }
    
    // Verificar se é uma URL válida
    try {
        const urlObj = new URL(url);
        
        // Verificar domínios conhecidos do Teams/Power Automate
        const dominiosValidos = [
            'outlook.office.com',
            'outlook.office365.com', 
            'prod-',  // Para URLs do Power Automate que começam com prod-
            'logic.azure.com',
            'flow.microsoft.com'
        ];
        
        const ehDominioValido = dominiosValidos.some(dominio => 
            urlObj.hostname.includes(dominio) || url.includes(dominio)
        );
        
        if (!ehDominioValido) {
            return { 
                valido: false, 
                erro: 'URL não parece ser um webhook do Teams/Power Automate',
                sugestao: 'Verifique se a URL contém outlook.office.com ou logic.azure.com'
            };
        }
        
        // Verificar se parece com webhook clássico (descontinuado)
        if (url.includes('outlook.office.com/webhook/')) {
            return {
                valido: true,
                aviso: 'Webhook clássico detectado. Pode estar descontinuado. Considere usar Power Automate.',
                tipo: 'classico'
            };
        }
        
        // Verificar se é Power Automate
        if (url.includes('logic.azure.com')) {
            return {
                valido: true,
                tipo: 'power-automate',
                info: 'URL do Power Automate detectada'
            };
        }
        
        return { valido: true, tipo: 'desconhecido' };
        
    } catch (error) {
        return { 
            valido: false, 
            erro: 'URL inválida: ' + error.message 
        };
    }
}

async function diagnosticarProblemaTeams() {
    console.log('🔍 === DIAGNÓSTICO COMPLETO DO TEAMS ===');
    
    if (!window.CONFIG.TEAMS_WEBHOOK_URL) {
        console.log('❌ URL do webhook não configurada');
        showToast('Configure a URL do webhook primeiro', 'error');
        return;
    }
    
    // 1. Validar URL
    const validacao = validarWebhookTeams(window.CONFIG.TEAMS_WEBHOOK_URL);
    console.log('1️⃣ Validação da URL:', validacao);
    
    if (!validacao.valido) {
        showToast(`❌ URL inválida: ${validacao.erro}`, 'error');
        if (validacao.sugestao) {
            showToast(`💡 ${validacao.sugestao}`, 'info');
        }
        return;
    }
    
    if (validacao.aviso) {
        console.log('⚠️ Aviso:', validacao.aviso);
        showToast(`⚠️ ${validacao.aviso}`, 'warning');
    }
    
    // 2. Teste de conectividade básica
    console.log('2️⃣ Testando conectividade...');
    try {
        const testeConexao = await fetch(window.CONFIG.TEAMS_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: '🔍 Teste de conectividade - ' + new Date().toLocaleString()
            })
        });
        
        console.log('Resposta do teste:', {
            status: testeConexao.status,
            statusText: testeConexao.statusText,
            ok: testeConexao.ok
        });
        
        if (testeConexao.ok) {
            showToast('✅ Conectividade OK', 'success');
        } else {
            const errorText = await testeConexao.text();
            console.log('Erro de resposta:', errorText);
            showToast(`❌ Erro ${testeConexao.status}: ${errorText}`, 'error');
            
            // Sugestões baseadas no erro
            if (testeConexao.status === 400) {
                showToast('💡 Verifique o formato da mensagem ou se o fluxo está configurado corretamente', 'info');
            } else if (testeConexao.status === 404) {
                showToast('💡 Webhook não encontrado. Reconfigure no Teams/Power Automate', 'warning');
            } else if (testeConexao.status === 403) {
                showToast('💡 Acesso negado. Verifique as permissões do fluxo', 'warning');
            }
        }
        
    } catch (error) {
        console.log('❌ Erro de rede:', error);
        showToast(`❌ Erro de conexão: ${error.message}`, 'error');
    }
    
    // 3. Instruções específicas baseadas no tipo
    console.log('3️⃣ Instruções específicas:');
    if (validacao.tipo === 'classico') {
        console.log('📋 Webhook clássico - pode estar descontinuado');
        showToast('💡 Considere migrar para Power Automate', 'info');
    } else if (validacao.tipo === 'power-automate') {
        console.log('📋 Power Automate detectado');
        showToast('💡 Verifique se o fluxo está "Ativado" no Power Automate', 'info');
    }
    
    console.log('🔍 === FIM DO DIAGNÓSTICO ===');
}

// === FUNÇÃO DE DEBUG RÁPIDO ===
window.debugTeams = function() {
    console.log('🔍 === DEBUG TEAMS ===');
    console.log('CONFIG existe:', typeof CONFIG !== 'undefined');
    console.log('window.CONFIG.TEAMS_ENABLED:', CONFIG?.TEAMS_ENABLED);
    console.log('window.CONFIG.TEAMS_WEBHOOK_URL:', CONFIG?.TEAMS_WEBHOOK_URL ? 'Configurado' : 'Não configurado');
    console.log('window.CONFIG.TEAMS_CONFIG:', CONFIG?.TEAMS_CONFIG);
    
    if (CONFIG?.TEAMS_WEBHOOK_URL) {
        console.log('URL do webhook (primeiros 50 chars):', window.CONFIG.TEAMS_WEBHOOK_URL.substring(0, 50) + '...');
    }
    
    // Testar função diretamente
    if (typeof enviarParaTeams === 'function') {
        console.log('✅ Função enviarParaTeams existe');
        
        const relatorioTeste = {
            id: Date.now(),
            prefeitura: 'Debug Test',
            opsInfo: 'Teste Debug Console',
            versaoSistema: 'debug-1.0',
            ambiente: 'Teste',
            criticidade: 5,
            timestamp: Date.now(),
            tarefas: [{id: 1, texto: 'Teste debug'}],
            conclusao: 'Teste pelo console'
        };
        
        console.log('Executando enviarParaTeams...');
        enviarParaTeams(relatorioTeste, 'debug').then(result => {
            console.log('Resultado:', result);
        }).catch(error => {
            console.log('Erro:', error);
        });
    } else {
        console.log('❌ Função enviarParaTeams não encontrada');
    }
};

window.testeRapidoTeams = function() {
    const relatorio = {
        id: Date.now(),
        prefeitura: 'TesteConsole',
        opsInfo: 'Teste Via Console',
        versaoSistema: 'console-1.0',
        ambiente: 'Debug',
        criticidade: 3,
        timestamp: Date.now(),
        tarefas: [{id: 1, texto: 'Teste direto'}],
        conclusao: 'Testando via console do navegador'
    };
    
    console.log('🧪 Executando teste direto...');
    return salvarRelatorio(relatorio);
};
