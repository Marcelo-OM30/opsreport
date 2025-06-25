# 📢 Configuração Microsoft Teams

## Como configurar o envio de relatórios para o Teams

### 1. Configurar Webhook no Teams

1. **Abra o Microsoft Teams** e vá para o canal onde deseja receber os relatórios

2. **Clique nos 3 pontos (⋯)** ao lado do nome do canal

3. **Selecione "Conectores"**

4. **Procure por "Webhook de Entrada"** e clique em "Adicionar"

5. **Configure o webhook:**
   - Nome: "Sistema de Relatórios OM30"
   - Descrição: "Recebe relatórios de operações automaticamente"
   - Imagem: (opcional) use um ícone de relatório

6. **Clique em "Criar"**

7. **Copie a URL gerada** (será algo como: `https://outlook.office.com/webhook/...`)

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

**Erro ao enviar para Teams:**
- ✅ Verifique se a URL do webhook está correta
- ✅ Teste a URL diretamente copiando e colando
- ✅ Certifique-se de que o conector não foi removido do canal

**Card não aparece formatado:**
- ✅ Teams pode demorar alguns segundos para renderizar
- ✅ Verifique se o webhook suporta cards adaptáticos

**Não está enviando automaticamente:**
- ✅ Confirme que `TEAMS_ENABLED: true`
- ✅ Verifique se `sendOnCreate: true` no TEAMS_CONFIG

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
