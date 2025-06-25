// ⚙️ EXEMPLO DE CONFIGURAÇÃO - Sistema de Relatórios de Operações
// 
// 📋 INSTRUÇÕES:
// 1. Copie este arquivo como 'config.js'
// 2. Configure seus dados do GitHub (opcional)
// 3. NUNCA faça commit do config.js com token real
//
// 💡 MODO LOCAL: Se não configurar GitHub, funcionará apenas localmente

// === CONFIGURAÇÃO PRINCIPAL ===
const CONFIG = {
    // 🔧 GitHub (OPCIONAL - para sincronização em equipe)
    GITHUB_TOKEN: 'SEU_TOKEN_AQUI',        // Token do GitHub (deixe assim para modo local)
    GITHUB_REPO: 'usuario/repositorio',     // Formato: 'owner/repo' (ex: 'joao/opsreport')
    
    // 👥 Equipe (opcional)
    TEAM_MEMBERS: [
        'Seu Nome',
        'Colega 1',
        'Colega 2'
        // Adicione mais membros...
    ],
    
    // ⚙️ Configurações gerais
    APP_NAME: 'Sistema de Relatórios de Operações',
    VERSION: '1.0.0',
    DEBUG_MODE: true  // Para ver logs detalhados
};

// === INSTRUÇÕES DETALHADAS ===
//
// 🌐 PARA USAR COM GITHUB (sincronização em equipe):
// 1. Vá em: https://github.com/settings/tokens
// 2. Clique "Generate new token (classic)"
// 3. Selecione permissão: ✅ repo (full control)
// 4. Copie o token e substitua 'SEU_TOKEN_AQUI'
// 5. Configure GITHUB_REPO com seu repositório
//
// 🏠 PARA USAR SÓ LOCAL (sem sincronização):
// - Deixe GITHUB_TOKEN como 'SEU_TOKEN_AQUI'
// - O sistema funcionará normalmente só no seu dispositivo
//
// � SEGURANÇA:
// - NUNCA compartilhe seu token
// - NUNCA faça commit do config.js com token real
// - Use .gitignore para proteger config.js

// Manter compatibilidade com código antigo
const GITHUB_CONFIG = {
    owner: CONFIG.GITHUB_REPO ? CONFIG.GITHUB_REPO.split('/')[0] : '',
    repo: CONFIG.GITHUB_REPO ? CONFIG.GITHUB_REPO.split('/')[1] : '',
    token: CONFIG.GITHUB_TOKEN
};

// 🏢 CONFIGURAÇÃO DAS PREFEITURAS
// Para adicionar/remover prefeituras, edite a lista no arquivo index.html:
const PREFEITURAS_EXEMPLO = [
    'jahu',
    'caieiras', 
    'cotia',
    'aruja',
    'hortolandia',
    'guaruja',
    'ibiuna'
    // Adicione novas prefeituras aqui
];

// 🌍 CONFIGURAÇÃO DOS AMBIENTES
const AMBIENTES_EXEMPLO = [
    'homologacao',
    'producao'
    // Adicione novos ambientes se necessário
];

// 🎨 CONFIGURAÇÃO DE CORES (CSS Variables)
const CORES_PERSONALIZADAS = {
    '--primary-color': '#3b82f6',      // Cor principal (azul)
    '--success-color': '#10b981',      // Cor de sucesso (verde)
    '--danger-color': '#ef4444',       // Cor de erro (vermelho)
    '--warning-color': '#f59e0b',      // Cor de aviso (amarelo)
};

// 📊 CONFIGURAÇÃO DA ESCALA DE CRITICIDADE
const ESCALA_CRITICIDADE = {
    1: { label: 'Baixa', color: '#10b981' },
    2: { label: 'Baixa', color: '#10b981' },
    3: { label: 'Baixa', color: '#10b981' },
    4: { label: 'Média', color: '#f59e0b' },
    5: { label: 'Média', color: '#f59e0b' },
    6: { label: 'Média', color: '#f59e0b' },
    7: { label: 'Alta', color: '#ef4444' },
    8: { label: 'Alta', color: '#ef4444' },
    9: { label: 'Alta', color: '#ef4444' },
    10: { label: 'Crítica', color: '#dc2626' }
};

// 💾 CONFIGURAÇÃO DE ARMAZENAMENTO
const STORAGE_CONFIG = {
    maxReports: 50,           // Máximo de relatórios armazenados localmente
    cleanupDays: 30,          // Dias para manter relatórios antigos
    autoCleanup: true         // Limpeza automática de dados antigos
};

/* 
📝 INSTRUÇÕES DE USO:

1. CONFIGURAR GITHUB:
   - Crie um token em: GitHub Settings > Developer settings > Personal access tokens
   - Dê permissão de 'repo' para o token
   - Substitua 'SEU_TOKEN_GITHUB' no script.js pelo token real

2. PERSONALIZAR PREFEITURAS:
   - Abra o arquivo index.html
   - Encontre o select com id="prefeitura"
   - Adicione/remova as opções conforme necessário

3. MODIFICAR CORES:
   - Abra o arquivo styles.css
   - Modifique as variáveis CSS em :root
   - As cores se atualizarão automaticamente em todo o sistema

4. DEPLOY NO GITHUB PAGES:
   - Faça push dos arquivos para o repositório GitHub
   - Ative GitHub Pages nas configurações do repositório
   - Seu sistema estará disponível em: https://SEU_USUARIO.github.io/opsReport

5. USAR O SISTEMA:
   - Acesse a URL do GitHub Pages
   - Preencha o formulário com os dados do relatório
   - Os dados serão salvos localmente e opcionalmente no GitHub Issues
   - Visualize os relatórios na seção "Relatórios Recentes"

🔗 Links Úteis:
- GitHub Pages: https://pages.github.com/
- Token GitHub: https://github.com/settings/tokens
- Font Awesome Icons: https://fontawesome.com/icons
- Google Fonts: https://fonts.google.com/

🆘 Problemas Comuns:
- Se o token não funcionar, verifique as permissões 'repo'
- Para CORS issues, certifique-se que o repositório é público
- Limpe o cache do navegador se as mudanças não aparecerem
*/
