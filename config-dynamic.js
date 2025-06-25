// Sistema de Configuração Dinâmica
// Este arquivo permite configurar o GitHub sem expor tokens

// Função utilitária para aguardar que a configuração seja carregada
function waitForConfig() {
    return new Promise((resolve) => {
        if (window.configLoaded && window.CONFIG) {
            resolve();
            return;
        }
        
        const checkConfig = () => {
            if (window.configLoaded && window.CONFIG) {
                resolve();
            } else {
                setTimeout(checkConfig, 50);
            }
        };
        
        checkConfig();
    });
}

const DynamicConfig = {
    // Configuração padrão (modo local)
    getConfig() {
        // 1. Tentar carregar da URL primeiro (link compartilhado)
        const urlConfig = getConfigFromURL();
        if (urlConfig) {
            return urlConfig;
        }
        
        // 2. Tentar carregar do localStorage 
        const savedConfig = localStorage.getItem('opsReport_config');
        
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                return {
                    GITHUB_TOKEN: parsed.token || null,
                    GITHUB_REPO: parsed.repo || 'usuario/repositorio',
                    TEAM_MEMBERS: parsed.team || ['Local User'],
                    APP_NAME: 'Sistema de Relatórios de Operações',
                    VERSION: '1.0.0',
                    EXPORT_CONFIG: {
                        includeTeamInfo: true,
                        includeTimestamp: true,
                        maxTasksInSummary: 10
                    },
                    DEBUG_MODE: true
                };
            } catch (e) {
                console.warn('Erro ao carregar configuração salva');
            }
        }
        
        // Configuração padrão
        return {
            GITHUB_TOKEN: null,
            GITHUB_REPO: 'usuario/repositorio',
            TEAM_MEMBERS: ['Local User'],
            APP_NAME: 'Sistema de Relatórios de Operações',
            VERSION: '1.0.0',
            EXPORT_CONFIG: {
                includeTeamInfo: true,
                includeTimestamp: true,
                maxTasksInSummary: 10
            },
            DEBUG_MODE: true
        };
    },
    
    // Salvar configuração no localStorage
    saveConfig(token, repo, team = []) {
        const config = {
            token: token,
            repo: repo,
            team: team.length > 0 ? team : ['Local User']
        };
        
        localStorage.setItem('opsReport_config', JSON.stringify(config));
        
        // Recarregar a página para aplicar nova configuração
        location.reload();
    },
    
    // Limpar configuração
    clearConfig() {
        localStorage.removeItem('opsReport_config');
        location.reload();
    },
    
    // Verificar se está configurado
    isConfigured() {
        const config = this.getConfig();
        return config.GITHUB_TOKEN && 
               config.GITHUB_TOKEN !== 'SEU_TOKEN_AQUI' &&
               config.GITHUB_REPO && 
               config.GITHUB_REPO !== 'usuario/repositorio';
    }
};

// Criar CONFIG global baseado na configuração dinâmica
const CONFIG = DynamicConfig.getConfig();

// Manter compatibilidade
const GITHUB_CONFIG = {
    owner: CONFIG.GITHUB_REPO ? CONFIG.GITHUB_REPO.split('/')[0] : '',
    repo: CONFIG.GITHUB_REPO ? CONFIG.GITHUB_REPO.split('/')[1] : '',
    token: CONFIG.GITHUB_TOKEN
};

// Log de status
if (typeof window !== 'undefined') {
    const isConfigured = DynamicConfig.isConfigured();
    
    if (CONFIG.DEBUG_MODE) {
        console.log('🔧 Sistema de Relatórios - Configuração Dinâmica');
        console.log('📡 GitHub configurado:', isConfigured ? '✅ Sim' : '❌ Não (modo local)');
        console.log('👥 Membros da equipe:', CONFIG.TEAM_MEMBERS.length);
        console.log('💾 Fonte:', localStorage.getItem('opsReport_config') ? 'localStorage' : 'padrão');
    }
}

// Funções globais para configuração
window.configureGitHub = (token, repo, team) => {
    DynamicConfig.saveConfig(token, repo, team);
};

window.clearGitHubConfig = () => {
    DynamicConfig.clearConfig();
};

window.showCurrentConfig = () => {
    console.log('=== CONFIGURAÇÃO ATUAL ===');
    console.log('Token configurado:', !!CONFIG.GITHUB_TOKEN);
    console.log('Repositório:', CONFIG.GITHUB_REPO);
    console.log('Equipe:', CONFIG.TEAM_MEMBERS);
    console.log('Configurado:', DynamicConfig.isConfigured());
};

// === CONFIGURAÇÃO COMPARTILHADA VIA URL ===

function getConfigFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    
    if (configParam) {
        try {
            // Decodificar configuração da URL (Base64)
            const decodedConfig = atob(configParam);
            const config = JSON.parse(decodedConfig);
            
            console.log('📡 Configuração carregada via URL');
            return {
                GITHUB_TOKEN: config.token,
                GITHUB_REPO: config.repo,
                TEAM_MEMBERS: config.team || ['Equipe'],
                APP_NAME: 'Sistema de Relatórios de Operações',
                VERSION: '1.0.0',
                EXPORT_CONFIG: {
                    includeTeamInfo: true,
                    includeTimestamp: true,
                    maxTasksInSummary: 10
                },
                DEBUG_MODE: true
            };
        } catch (error) {
            console.warn('Erro ao carregar configuração da URL:', error);
        }
    }
    
    return null;
}

// Gerar URL de compartilhamento
function generateShareableURL(token, repo, team) {
    const config = {
        token: token,
        repo: repo,
        team: team
    };
    
    const encodedConfig = btoa(JSON.stringify(config));
    const currentURL = window.location.origin + window.location.pathname;
    const shareURL = `${currentURL}?config=${encodedConfig}`;
    
    return shareURL;
}

// Adicionar botão para gerar link de compartilhamento
function addShareButton() {
    const configActions = document.querySelector('.modal-actions');
    if (configActions && !document.getElementById('shareButton')) {
        const shareBtn = document.createElement('button');
        shareBtn.id = 'shareButton';
        shareBtn.type = 'button';
        shareBtn.className = 'btn';
        shareBtn.style.backgroundColor = '#10b981';
        shareBtn.innerHTML = '<i class="fas fa-share"></i> Gerar Link Equipe';
        
        shareBtn.addEventListener('click', generateTeamLink);
        configActions.appendChild(shareBtn);
    }
}

function generateTeamLink() {
    const token = document.getElementById('githubToken').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();
    const teamText = document.getElementById('teamMembers').value.trim();
    const team = teamText.split(',').map(name => name.trim()).filter(name => name);
    
    if (!token || !repo) {
        showConfigMessage('Preencha o token e repositório primeiro.', 'error');
        return;
    }
    
    const shareURL = generateShareableURL(token, repo, team);
    
    // Copiar para clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareURL).then(() => {
            showConfigMessage('✅ Link copiado! Compartilhe com a equipe.', 'success');
        }).catch(() => {
            showShareURL(shareURL);
        });
    } else {
        showShareURL(shareURL);
    }
}

function showShareURL(url) {
    const statusDiv = document.getElementById('configStatus');
    statusDiv.innerHTML = `
        <strong>Link para a equipe:</strong><br>
        <textarea readonly style="width: 100%; height: 60px; margin: 10px 0; font-size: 12px;">${url}</textarea>
        <br><small>Copie e compartilhe este link com a equipe</small>
    `;
    statusDiv.className = 'config-status success';
    statusDiv.style.display = 'block';
}
