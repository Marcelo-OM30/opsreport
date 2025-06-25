// Configuração PÚBLICA do Sistema de Relatórios
// Este arquivo SERÁ commitado - NÃO coloque dados sensíveis aqui!

const CONFIG = {
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

// === CONFIGURAÇÕES AVANÇADAS ===
if (typeof window !== 'undefined') {
    // Tentar carregar configuração do localStorage
    try {
        const localConfig = localStorage.getItem('opsReport_config');
        if (localConfig) {
            const parsed = JSON.parse(localConfig);
            if (parsed.teamsWebhook) {
                CONFIG.TEAMS_WEBHOOK_URL = parsed.teamsWebhook;
                CONFIG.TEAMS_ENABLED = parsed.teamsEnabled || false;
            }
            if (parsed.token) {
                CONFIG.GITHUB_TOKEN = parsed.token;
            }
        }
    } catch (error) {
        console.warn('Erro ao carregar configuração local:', error);
    }
    
    // Log de status
    if (CONFIG.DEBUG_MODE) {
        console.log('🔧 Configuração pública carregada');
        console.log('📡 GitHub:', CONFIG.GITHUB_TOKEN ? '✅ Configurado' : '❌ Configure via modal');
        console.log('📢 Teams:', CONFIG.TEAMS_ENABLED ? '✅ Habilitado' : '❌ Configure via modal');
    }
}

// Manter compatibilidade
const GITHUB_CONFIG = {
    owner: CONFIG.GITHUB_REPO ? CONFIG.GITHUB_REPO.split('/')[0] : '',
    repo: CONFIG.GITHUB_REPO ? CONFIG.GITHUB_REPO.split('/')[1] : '',
    token: CONFIG.GITHUB_TOKEN
};
