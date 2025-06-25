// Configuração do GitHub (você precisará configurar estas variáveis)
const GITHUB_CONFIG = {
    owner: 'Marcelo-OM30', // Seu usuário do GitHub
    repo: 'opsReport', // Nome do repositório
    token: 'SUBSTITUA_PELO_SEU_TOKEN' // Configure após o deploy
};

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

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateCriticidadeDisplay();
    loadReports();
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
        showToast('Erro ao salvar relatório. Tente novamente.', 'error');
    }
}

async function salvarRelatorio(relatorio) {
    // Se não tiver token configurado, salvar localmente
    if (!GITHUB_CONFIG.token || GITHUB_CONFIG.token === 'SEU_TOKEN_GITHUB') {
        salvarRelatorioLocal(relatorio);
        return;
    }
    
    try {
        // Criar issue no GitHub
        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
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
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        relatorio.githubUrl = result.html_url;
        
        // Também salvar localmente como backup
        salvarRelatorioLocal(relatorio);
        
    } catch (error) {
        console.error('Erro ao salvar no GitHub:', error);
        // Fallback para salvamento local
        salvarRelatorioLocal(relatorio);
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
        
        // Carregar relatórios locais
        const relatoriosLocais = JSON.parse(localStorage.getItem('opsReports') || '[]');
        
        if (relatoriosLocais.length === 0) {
            reportsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Nenhum relatório encontrado ainda.</p>';
            return;
        }
        
        renderReports(relatoriosLocais);
        
    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        reportsContainer.innerHTML = '<p style="text-align: center; color: var(--danger-color); padding: 40px;">Erro ao carregar relatórios.</p>';
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
                <div><strong>Tarefas:</strong> ${report.tarefas.length}</div>
                ${report.githubUrl ? `<div><a href="${report.githubUrl}" target="_blank" style="color: var(--primary-color);">Ver no GitHub</a></div>` : ''}
            </div>
            ${report.erros && report.erros !== 'Nenhum erro reportado' ? 
                `<div style="margin-top: 15px;"><strong>Erros:</strong><br><small>${escapeHtml(report.erros.substring(0, 100))}${report.erros.length > 100 ? '...' : ''}</small></div>` : 
                ''}
        </div>
    `).join('');
    
    reportsContainer.innerHTML = html;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    
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
    
    // Remover após 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
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
