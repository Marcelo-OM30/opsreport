# 📋 Sistema de Relatório de Operações

Sistema completo para registro e acompanhamento de relatórios de deploy e operações, desenvolvido para funcionar com GitHub Pages.

## � **Compartilhamento em Equipe**

### **Como funciona:**
- ✅ **Todos veem todos os relatórios** - Sistema carrega automaticamente relatórios de todos os membros da equipe
- ✅ **Salvamento inteligente** - Salva no GitHub Issues (se token configurado) + backup local
- ✅ **Funciona sem configuração** - Carrega relatórios públicos do repositório
- ✅ **Informações do autor** - Mostra quem criou cada relatório

### **Para configuração completa (opcional):**
1. **Gere um Personal Access Token** no GitHub com permissão `repo`
2. **Configure o token** (veja seção de configuração abaixo)
3. **Toda a equipe terá acesso** aos relatórios automaticamente

## �🚀 Funcionalidades

- ✅ **Formulário Completo**: Prefeitura, ambiente, erros, criticidade, tarefas e avaliação QA
- 📊 **Escala de Criticidade**: De 1 a 10 com indicadores visuais
- ✏️ **Gerenciamento de Tarefas**: Adicionar e remover tarefas dinamicamente
- 💾 **Persistência de Dados**: Armazenamento local + integração opcional com GitHub Issues
- 👥 **Colaboração em Equipe**: Todos os membros veem todos os relatórios
- 📱 **Design Responsivo**: Funciona perfeitamente em desktop e móveis
- 🎨 **Interface Moderna**: Design limpo e intuitivo
- 📈 **Histórico de Relatórios**: Visualização dos relatórios recentes

## 🏗️ Configuração no GitHub Pages

### 1. Criar o Repositório

1. Faça login na sua conta do GitHub
2. Crie um novo repositório chamado `opsReport`
3. Marque como **público** (necessário para GitHub Pages gratuito)
4. Faça upload dos arquivos deste projeto para o repositório

### 2. Ativar GitHub Pages

1. Vá para as **Settings** do repositório
2. Role até a seção **Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Escolha **main** branch e **/ (root)**
5. Clique em **Save**

Seu site estará disponível em: `https://SEU_USUARIO.github.io/opsReport`

### 3. Configuração do Token GitHub (Opcional)

Para salvar os dados no GitHub Issues (recomendado para persistência):

1. **Criar Token de Acesso**:
   - Vá para **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
   - Clique em **Generate new token (classic)**
   - Marque os scopes: `repo` (todos os sub-scopes)
   - Copie o token gerado

2. **Configurar no Código**:
   - Abra o arquivo `script.js`
   - Edite as configurações no início:
   ```javascript
   const GITHUB_CONFIG = {
       owner: 'SEU_USUARIO_GITHUB', // Seu usuário do GitHub
       repo: 'opsReport',
       token: 'SEU_TOKEN_AQUI' // Cole o token aqui
   };
   ```

⚠️ **IMPORTANTE - Segurança**: 
- **NUNCA** faça commit do token real no código
- O token deve ser configurado apenas **APÓS** fazer o push para o GitHub
- Para projetos em produção, considere usar GitHub Actions Secrets ou variáveis de ambiente

## ⚠️ AVISO DE SEGURANÇA IMPORTANTE

**NUNCA faça commit do arquivo `config.js` com um token real do GitHub!**

Se você já commitou o arquivo com um token, faça o seguinte IMEDIATAMENTE:

1. **Revogue o token imediatamente**:
   - Vá em https://github.com/settings/tokens
   - Encontre o token e clique em **Delete**

2. **Gere um novo token**:
   - Clique em **Generate new token (classic)**
   - Configure as permissões necessárias
   - Copie o novo token

3. **Configure o novo token localmente**:
   - Edite `config.js` com o novo token
   - NUNCA faça commit deste arquivo

4. **Verifique se está no .gitignore**:
   - O arquivo `config.js` deve estar listado no `.gitignore`

## 🚨 Solução de Problemas Comuns

### ❌ Erro: "Failed to load resource: config.js 404"

**Problema**: O navegador não consegue carregar o arquivo `config.js`.

**Soluções**:

1. **Se você está acessando via `file://`** (arquivo local):
   - ❌ Não funciona: `file:///caminho/para/index.html`
   - ✅ Use um servidor local:
     ```bash
     # Opção 1: Python
     python -m http.server 8000
     
     # Opção 2: Node.js
     npx serve .
     
     # Opção 3: VS Code Live Server
     # Instale a extensão "Live Server" e clique com botão direito > "Open with Live Server"
     ```
   - Acesse: `http://localhost:8000`

2. **Se você está no GitHub Pages**:
   - Verifique se o `config.js` está no repositório
   - Confirme que não está no `.gitignore`
   - Aguarde alguns minutos para o deploy

3. **Verificar se o arquivo existe**:
   ```bash
   # No terminal, dentro da pasta do projeto:
   ls -la config.js
   ```

4. **Criar config.js se não existir**:
   ```bash
   cp config.example.js config.js
   ```

### ⚠️ Sistema em Modo Local

Se o `config.js` não for encontrado, o sistema automaticamente:
- ✅ Funciona em modo local (sem sincronização GitHub)
- ✅ Salva relatórios no navegador (localStorage)
- ✅ Permite exportação Excel/Word
- ❌ Não sincroniza entre dispositivos da equipe

## 🚀 Como Usar

### Preenchendo um Relatório

1. **Prefeitura**: Selecione uma das prefeituras disponíveis
2. **Ambiente**: Escolha entre Homologação ou Produção
3. **Erros**: Descreva os erros encontrados (opcional)
4. **Criticidade**: Use o slider para definir de 1 (baixa) a 10 (crítica)
5. **Tarefas**: 
   - Digite uma tarefa e clique em "Adicionar"
   - Repita para adicionar múltiplas tarefas
   - Use o botão de lixeira para remover tarefas
6. **Avaliação QA**: Adicione comentários da avaliação de qualidade
7. **Conclusão**: Marque como Aprovado ou Recusado
8. Clique em **Salvar Relatório**

### Visualizando Relatórios

- Os relatórios recentes aparecem automaticamente na parte inferior da página
- Se configurado com GitHub, cada relatório vira uma Issue no repositório
- Os dados ficam salvos localmente no navegador como backup

## 🎨 Personalização

### Adicionando Novas Prefeituras

Edite o arquivo `index.html` na seção do select de prefeituras:

```html
<select id="prefeitura" name="prefeitura" required>
    <option value="nova_prefeitura">Nova Prefeitura</option>
    <!-- ... outras opções ... -->
</select>
```

### Modificando Cores e Estilos

As cores principais estão definidas no arquivo `styles.css` nas variáveis CSS:

```css
:root {
    --primary-color: #3b82f6;
    --success-color: #10b981;
    --danger-color: #ef4444;
    /* ... outras cores ... */
}
```

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura e formulários
- **CSS3**: Estilos modernos com Flexbox/Grid
- **JavaScript**: Funcionalidade e interatividade
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia (Inter)
- **GitHub Pages**: Hospedagem
- **GitHub Issues API**: Persistência de dados (opcional)

## 📱 Compatibilidade

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móveis

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se todos os arquivos estão no repositório
2. Confirme que o GitHub Pages está ativado
3. Verifique o console do navegador para erros
4. Para issues com GitHub API, verifique se o token tem as permissões corretas

---

**Desenvolvido com ❤️ para facilitar o acompanhamento de operações**

## 📢 Integração com Microsoft Teams

### **Envio Automático para Teams**
- ✅ **Cards Formatados**: Relatórios enviados como cards visuais no Teams
- ✅ **Cores por Criticidade**: Verde (baixa) → Vermelho (crítica)  
- ✅ **Informações Completas**: Todos os dados do relatório organizados
- ✅ **Links de Ação**: Botões para ver detalhes e acessar GitHub
- ✅ **Não Intrusivo**: Falha no Teams não afeta o salvamento

### **Configuração Rápida:**
1. No Teams: Canal → ⋯ → Conectores → "Webhook de Entrada"
2. No Sistema: Config → Seção "Microsoft Teams" → Cole a URL do webhook
3. Ative "Habilitar envio para Teams"
4. Teste com "Testar Teams"

📖 **Documentação completa:** [TEAMS.md](./TEAMS.md)
