# 📢 Configuração Microsoft Teams

## Como configurar o envio de relatórios para o Teams

### 1. Configurar Webhook no Teams

**Método 1: Via Fluxos de Trabalho (Recomendado)**

1. **Abra o Microsoft Teams** e vá para o canal onde deseja receber os relatórios

2. **Clique nos 3 pontos (⋯)** ao lado do nome do canal

3. **Selecione "Fluxos de trabalho"**

4. **Procure por "Postar para um canal quando um webhook receber uma solicitação"**

5. **Clique em "Adicionar fluxo de trabalho"**

6. **Configure:**
   - Nome do fluxo: "Relatórios OM30"
   - Selecione a equipe e canal corretos
   - Clique em "Adicionar fluxo de trabalho"

7. **Copie a URL gerada** (será algo como: `https://prod-XX.westus.logic.azure.com:443/workflows/...`)

**Método 2: Via Power Automate (Alternativo)**

1. **Acesse** [https://make.powerautomate.com](https://make.powerautomate.com)

2. **Crie um novo fluxo** → "Fluxo de nuvem instantâneo"

3. **Nome:** "Webhook Relatórios Teams"

4. **Gatilho:** "Quando uma solicitação HTTP é recebida"

5. **Adicione ação:** "Postar mensagem em um chat ou canal" (Teams)

6. **Configure:**
   - Tipo: Canal
   - Equipe: Sua equipe
   - Canal: Canal desejado
   - Mensagem: Use conteúdo dinâmico do corpo da solicitação

7. **Salve** e copie a **URL do gatilho HTTP**

### 2. Configurar no Sistema

1. **Abra o sistema de relatórios**

2. **Clique em "Config"**

3. **Na seção "Microsoft Teams":**
   - Cole a URL do webhook
   - Marque "Habilitar envio para Teams"

4. **Clique em "Salvar Configuração"**

5. **Teste a integração** clicando em "Testar Teams"

### 3. Configuração Permanente (config.js)

Para salvar permanentemente, edite o arquivo `config.js`:

```javascript
// === CONFIGURAÇÃO DO MICROSOFT TEAMS ===
TEAMS_WEBHOOK_URL: 'SUA_URL_DO_WEBHOOK_AQUI',
TEAMS_ENABLED: true,

TEAMS_CONFIG: {
    sendOnCreate: true,     // Enviar quando criar relatório
    sendSummary: true,      // Enviar resumo diário/semanal
    mentionTeam: false,     // Mencionar @team no canal
    includeDetails: true    // Incluir detalhes completos
},
```

### 4. O que será enviado

Quando um relatório for criado, será enviado um **card adaptativo** para o Teams contendo:

- 🏛️ **Prefeitura**
- 📋 **Informações da operação**
- 🔧 **Versão do sistema**
- 🌐 **Ambiente**
- ⚠️ **Criticidade** (com cores)
- 👤 **Responsável**
- 📅 **Data/hora**
- 📝 **Principais tarefas**
- ✅ **Conclusão**
- 🔗 **Links para ver mais detalhes**

### 5. Cores dos Cards

- 🟢 **Verde**: Criticidade baixa (1-3)
- 🟡 **Amarelo**: Criticidade média (4-6)
- 🟠 **Laranja**: Criticidade alta (7-8)
- 🔴 **Vermelho**: Criticidade crítica (9-10)

### 6. Botões de Ação

Cada card terá botões para:
- 📊 **Ver Todos os Relatórios** (site principal)
- 🔗 **Ver no GitHub** (se configurado)

### 7. Solução de Problemas

**"Sucesso mas não aparece no Teams":**
- ✅ Use o botão "Diagnosticar Teams" para análise detalhada
- ✅ No Power Automate: verifique se o fluxo está "Ativado"
- ✅ Verifique se selecionou a equipe e canal corretos
- ✅ Aguarde até 30 segundos - Power Automate pode ter delay
- ✅ Confira o histórico de execução no Power Automate

**"Não encontro a opção Conectores":**
- ✅ Use "Fluxos de trabalho" ou Power Automate (métodos atualizados)
- ✅ A Microsoft descontinuou conectores clássicos em muitas versões

**Erro 400 (Bad Request):**
- ✅ Verifique se o formato da mensagem está correto
- ✅ Para Power Automate: certifique-se que configurou para receber JSON
- ✅ Teste com mensagem simples primeiro

**Erro 404 (Not Found):**
- ✅ Webhook foi removido ou URL está incorreta
- ✅ Reconfigure o fluxo no Teams/Power Automate
- ✅ Copie a URL novamente

**Erro 403 (Forbidden):**
- ✅ Permissões insuficientes no fluxo
- ✅ Verifique se o fluxo tem acesso ao canal
- ✅ Recrie o fluxo com permissões corretas

**Power Automate específico:**
- ✅ Acesse [https://make.powerautomate.com](https://make.powerautomate.com)
- ✅ Vá em "Meus fluxos" → encontre seu fluxo
- ✅ Verifique se está "Ativado" (toggle verde)
- ✅ Clique no fluxo → "Histórico de execução" para ver logs
- ✅ Se houver erro, ajuste a configuração da ação do Teams

**Teste manual do webhook:**
```bash
# Teste via curl (substitua SUA_URL):
curl -X POST "SUA_URL" \
  -H "Content-Type: application/json" \
  -d '{"text":"Teste manual do webhook"}'
```

### 8. Segurança

⚠️ **IMPORTANTE:**
- Não compartilhe a URL do webhook publicamente
- A URL contém token de acesso ao seu canal
- Se comprometida, revogue o conector e crie novo

### 9. Recursos Futuros

🚀 **Em desenvolvimento:**
- Resumos automáticos diários/semanais
- Notificações de criticidade alta
- Integração com @mentions da equipe
- Dashboard de métricas no Teams

---

💡 **Dica:** Use um canal dedicado para relatórios (ex: #operações-relatórios) para não sobrecarregar canais gerais.
