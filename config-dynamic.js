// Sistema de Configuração Dinâmica
// Este arquivo permite configurar o GitHub sem expor tokens

const DynamicConfig = {
    // Configuração padrão (modo local)
    getConfig() {
        // Tentar carregar do localStorage primeiro
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
