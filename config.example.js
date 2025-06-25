// ⚙️ CONFIGURAÇÃO DO SISTEMA
// 
// Este arquivo contém as configurações principais do sistema.
// Copie e cole essas configurações no arquivo script.js para personalizar o sistema.

// 🔧 CONFIGURAÇÃO DO GITHUB (Para persistência de dados)
const GITHUB_CONFIG_EXAMPLE = {
    owner: 'seu-usuario-github',     // 👤 Substitua pelo seu usuário do GitHub
    repo: 'opsReport',               // 📁 Nome do repositório (mantenha como 'opsReport')
    token: 'ghp_xxxxxxxxxxxxxxxxx'   // 🔑 Token do GitHub (veja instruções no README)
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
