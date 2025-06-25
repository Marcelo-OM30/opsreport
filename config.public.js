// Configuração PÚBLICA do Sistema de Relatórios
// Este arquivo SERÁ commitado - NÃO coloque dados sensíveis aqui!

// Configuração base que será mesclada com window.CONFIG
const CONFIG_PUBLIC = {
    // === CONFIGURAÇÃO BÁSICA ===
    GITHUB_TOKEN: null, // Configure via interface ou config.js local
    GITHUB_REPO: 'Marcelo-OM30/opsreport',
    
    // === CONFIGURAÇÃO DA EQUIPE ===
    TEAM_MEMBERS: [
        'Marcelo',
        'Bruno', 
        'Cibele',
        'Patrick'
    ],
    
    // === CONFIGURAÇÕES GERAIS ===
    APP_NAME: 'Sistema de Relatórios de Operações',
    VERSION: '1.0.0',
    DEBUG_MODE: true,
    
    // === CONFIGURAÇÕES DE EXPORTAÇÃO ===
    EXPORT_CONFIG: {
        includeTeamInfo: true,
        includeTimestamp: true,
        maxTasksInSummary: 10
    },
    
    // === MICROSOFT TEAMS ===
    // Configure via interface ou em config.js local
    TEAMS_WEBHOOK_URL: null, // Será configurado via modal "Config"
    TEAMS_ENABLED: false,    // Será habilitado via modal "Config"
    
    TEAMS_CONFIG: {
        sendOnCreate: true,
        sendSummary: true,
        mentionTeam: false,
        includeDetails: true
    }
};

// === APLICAR CONFIGURAÇÃO ===
if (typeof window !== 'undefined') {
    // Inicializar CONFIG se não existir
    window.CONFIG = window.CONFIG || {};
    
    // Mesclar configuração pública com a existente
    Object.assign(window.CONFIG, CONFIG_PUBLIC);
    
    // Tentar carregar configuração do localStorage (sobrescreve as configurações acima)
    try {
        const localConfig = localStorage.getItem('opsReport_config');
        if (localConfig) {
            const parsed = JSON.parse(localConfig);
            if (parsed.teamsWebhook) {
                window.CONFIG.TEAMS_WEBHOOK_URL = parsed.teamsWebhook;
                window.CONFIG.TEAMS_ENABLED = parsed.teamsEnabled || false;
            }
            if (parsed.token) {
                window.CONFIG.GITHUB_TOKEN = parsed.token;
            }
            if (parsed.repo) {
                window.CONFIG.GITHUB_REPO = parsed.repo;
            }
            if (parsed.team) {
                window.CONFIG.TEAM_MEMBERS = parsed.team;
            }
        }
    } catch (error) {
        console.warn('Erro ao carregar configuração local:', error);
    }
    
    // Log de status
    if (window.CONFIG.DEBUG_MODE) {
        console.log('🔧 Configuração pública carregada e mesclada');
        console.log('📡 GitHub:', window.CONFIG.GITHUB_TOKEN ? '✅ Configurado' : '❌ Configure via modal');
        console.log('📢 Teams:', window.CONFIG.TEAMS_ENABLED ? '✅ Habilitado' : '❌ Configure via modal');
    }
}

// Manter compatibilidade com código que espera GITHUB_CONFIG
if (typeof window !== 'undefined') {
    window.GITHUB_CONFIG = {
        owner: window.CONFIG.GITHUB_REPO ? window.CONFIG.GITHUB_REPO.split('/')[0] : '',
        repo: window.CONFIG.GITHUB_REPO ? window.CONFIG.GITHUB_REPO.split('/')[1] : '',
        token: window.CONFIG.GITHUB_TOKEN
    };
}
