# SGQ Via Néctare

Sistema de Gestão da Qualidade da Via Néctare, usado para registrar, consultar, editar, acompanhar e exportar formulários operacionais da qualidade, produção, recebimento, expedição, laboratório, campo e áreas relacionadas.

O sistema funciona como uma aplicação web responsiva com suporte a PWA, armazenamento local no navegador e sincronização com banco PostgreSQL por meio de uma API Node.js.

## Objetivo do sistema

O SGQ centraliza os registros de qualidade em formato digital, reduzindo o uso de formulários físicos e facilitando:

- Preenchimento de formulários padronizados por protocolo.
- Controle de acesso por usuário, perfil e permissão.
- Consulta do histórico de registros.
- Edição e continuidade de formulários pendentes.
- Exportação de dados para Excel.
- Rastreamento de ações por logs.
- Trabalho offline com sincronização posterior.
- Geração e consulta de códigos de lote com QR Code.

## Tecnologias utilizadas

- Frontend: React 18, TypeScript e Vite.
- Estilização: Tailwind CSS e Font Awesome.
- PWA: vite-plugin-pwa, service worker e manifest.
- Banco local do navegador: IndexedDB via Dexie.
- Backend: Node.js, Express e pg.
- Banco de dados: PostgreSQL.
- Exportação: xlsx.
- QR Code: qrcode.
- Notificações e alertas: sonner.

## Estrutura principal do projeto

```text
.
├── App.tsx                         # Controle geral de login, navegação e telas
├── constants.tsx                   # Cadastro dos formulários disponíveis
├── types.ts                        # Tipos principais do sistema
├── components/
│   ├── Login.tsx                   # Tela de acesso
│   ├── Header.tsx                  # Menu superior, mobile, tema e sincronização
│   ├── Dashboard.tsx               # Painel de formulários e indicadores
│   ├── FormContainer.tsx           # Carregamento e salvamento dos formulários
│   ├── DataViewer.tsx              # Histórico, filtros, visualização e impressão
│   ├── PendingForms.tsx            # Formulários pendentes
│   ├── Settings.tsx                # Área administrativa
│   ├── UserManagement.tsx          # Gestão de usuários e permissões
│   ├── ActivityLogs.tsx            # Consulta de logs
│   └── forms/                      # Formulários operacionais
├── lib/
│   ├── api.ts                      # Cliente HTTP da API
│   ├── db.ts                       # Banco local IndexedDB
│   ├── sync.ts                     # Sincronização online/offline
│   ├── roles.ts                    # Regras de perfis
│   └── permissions.ts              # Normalização de permissões
├── utils/
│   ├── excelExport.ts              # Exportação para Excel
│   └── logger.ts                   # Registro de logs
├── backend/
│   ├── server.js                   # API Express
│   ├── db.js                       # Conexão PostgreSQL
│   └── app.js                      # Entrada para hospedagem Passenger/Localweb
├── init.sql                        # Criação inicial do banco local
├── supabase_view.sql               # Criação/reparo de tabelas e view agregada
├── docker-compose.yml              # PostgreSQL local via Docker
└── vite.config.ts                  # Configuração Vite e PWA
```

## Como o sistema funciona

### Fluxo geral

1. O usuário acessa a tela de login.
2. O frontend consulta a tabela `users` pela API.
3. Após login válido, os dados do usuário são salvos no `localStorage`.
4. O painel exibe apenas os formulários permitidos ao usuário.
5. Ao preencher um formulário, o sistema monta um registro com:
   - tipo do formulário;
   - data e hora;
   - usuário responsável;
   - código do protocolo;
   - dados preenchidos.
6. O registro é salvo no IndexedDB local.
7. Se houver conexão, o registro é enviado para o PostgreSQL pela API.
8. Se não houver conexão ou ocorrer erro na API, o registro fica em fila de sincronização.
9. Quando a conexão volta, a fila é processada automaticamente.
10. Os relatórios consultam os dados locais sincronizados e permitem visualizar, editar, excluir, imprimir ou exportar.

### Armazenamento local e sincronização

O navegador mantém uma base local chamada `SGQDatabase`, criada com Dexie/IndexedDB.

Ela possui duas tabelas principais:

- `records`: armazena registros dos formulários no navegador.
- `syncQueue`: armazena ações pendentes de sincronização, como criação, edição e exclusão.

O serviço `syncService` executa:

- busca remota periódica a cada 60 segundos;
- sincronização inicial ao abrir o sistema;
- processamento automático quando a internet volta;
- envio de registros criados ou editados;
- exclusão local e remota;
- indicação visual de itens pendentes.

Os status usados nos registros locais são:

- `synced`: registro sincronizado com o banco.
- `pending_insert`: novo registro aguardando envio.
- `pending_update`: alteração aguardando envio.
- `pending_delete`: exclusão aguardando envio.

## Perfis de usuário

O sistema possui três perfis:

| Perfil | Descrição |
| --- | --- |
| `OPERADOR` | Acessa apenas os formulários liberados individualmente. |
| `ADMIN` | Possui acesso total aos formulários e recursos principais. |
| `ADMIN_TI` | Possui acesso total e também gerencia usuários, permissões e logs. |

Administradores visualizam todos os formulários. Operadores visualizam somente os formulários marcados em suas permissões.

## Como usar o sistema

### 1. Acessar

1. Abra o endereço do SGQ no navegador.
2. Informe usuário e senha.
3. Clique em `ACESSAR SISTEMA`.

Se a API não estiver disponível, o login mostra erro de conexão com o servidor local.

### 2. Navegar pelo painel

Após o login, o usuário é direcionado ao `Painel de Formulários`.

No painel é possível:

- buscar formulário por título ou código;
- ordenar por padrão, código ou setor;
- abrir um formulário clicando no card;
- acompanhar volume de registros por data;
- visualizar atividades recentes.

### 3. Preencher um formulário

1. Clique no card do formulário desejado.
2. Preencha os campos solicitados.
3. Salve o formulário.
4. Aguarde a mensagem de confirmação.

Quando online, o sistema exibe confirmação de dados sincronizados. Quando offline, o registro é salvo localmente e enviado depois.

### 4. Continuar formulário pendente

A tela `Pendentes` lista registros marcados como pendentes no banco local.

Use essa tela quando um formulário foi iniciado e precisa ser finalizado depois.

1. Acesse `Pendentes`.
2. Localize o registro.
3. Clique em `Continuar Preenchimento`.
4. Finalize e salve.

### 5. Consultar histórico e relatórios

A tela `Relatórios` mostra os registros salvos.

Recursos disponíveis:

- filtro por formulário;
- filtro por data inicial e final;
- pesquisa textual;
- paginação;
- visualização detalhada;
- edição de registro;
- exclusão para administradores;
- impressão em PDF pelo navegador;
- QR Code para rastreio de lote quando aplicável.

### 6. Editar um registro

1. Entre em `Relatórios`.
2. Encontre o registro.
3. Clique no ícone de edição.
4. Altere os dados necessários.
5. Salve.

O sistema registra log informando que o registro foi editado.

### 7. Exportar para Excel

A exportação pode ser acionada pelo menu `Relatórios > Exportar Excel` ou pelo botão de exportação.

O sistema permite exportar:

- todos os registros;
- registros de um formulário específico.

O arquivo gerado usa o padrão:

```text
Export_SGQ_Geral_<timestamp>.xlsx
Export_SGQ_<codigo_do_formulario>_<timestamp>.xlsx
```

Durante a exportação, os dados JSON são tratados e achatados em colunas para facilitar análise em planilhas.

### 8. Usar offline

O SGQ possui comportamento offline para preenchimento e fila de sincronização.

Quando o usuário perde conexão:

- o cabeçalho indica modo offline;
- registros salvos ficam no navegador;
- ações pendentes são adicionadas à fila;
- ao voltar a conexão, o sistema tenta sincronizar automaticamente;
- também é possível clicar em `Sincronizar` quando houver itens pendentes.

Importante: não limpe os dados do navegador antes de sincronizar, pois registros pendentes ficam armazenados localmente.

## Telas do sistema

### Login

Responsável por autenticar o usuário. A validação é feita buscando o login na tabela `users` e comparando a senha informada.

### Dashboard

Tela inicial após login. Exibe:

- cards dos formulários disponíveis;
- busca por título ou código;
- organização por código ou setor;
- indicadores de volume por data;
- últimas atividades do dia.

### Formulários

Cada formulário fica em `components/forms`.

O `FormContainer` escolhe qual componente renderizar conforme o `FormType`. Ao salvar, todos passam pelo mesmo fluxo de persistência e sincronização.

### Pendentes

Lista formulários com `status = pending` ou `data.status = pending` no banco local IndexedDB.

### Relatórios

Consulta registros locais sincronizados ou pendentes. Permite visualizar detalhes em modal, imprimir PDF, editar e excluir.

### Estatísticas

Tela de indicadores analíticos do sistema.

### Configurações

Área administrativa com:

- usuários e acessos;
- logs do sistema;
- notas de versões.

A gestão de usuários e logs aparece apenas para `ADMIN_TI`.

## Formulários disponíveis

Os formulários são cadastrados em `constants.tsx`. Cada formulário possui tipo interno, título, código, revisão, emissão, ícone e cor.

| Código | Formulário |
| --- | --- |
| F01.05-PR | Controle de Descarga de Frutas |
| F18.01-CQ | Controle de Entrada e Moagem da Fruta |
| F08.01-CQ | Relatório de % de Polpa de Abacaxi |
| F02.08-CQ | Liberação de Blender |
| F01.03-PR | Controle de Blender |
| F-REPROC | Monitoramento de Reprocessos |
| F18.01-AG | Aplicação de Insumos Orgânicos |
| F01.01-AG | Aplicação de Pesticidas |
| F15.01-AG | Checklist de Caminhões |
| F12.01-AG | Mapeamento na Lavoura |
| F02.06-AL | Movimentação de Materiais |
| F01.01-AL | Análise de Recebimento |
| F02.01-AL | Checklist de Recebimento |
| F07.02-PR | Checklist Entrada Caminhões Fruta |
| F37.01-PR | Cadastro Veículo Portaria |
| F01.07-EX | Ordem Entrada / Saída / Estoque |
| F01.02-EX | Checklist Carregamento Container |
| F06.01-EX | Checklist Inspeção de Caminhão |
| F01.03-EX | Relatório Packing List |
| F07.01-EX | Pedido de Carregamento |
| F01.01-EX | Checklist de Carregamentos |
| F16.02-CQ | Monitoramento de Produção CQ |
| F01.15-PR | Controle Operação Despolpamento |
| F06.06-PR | Controle Lotes/Amostras Asséptico |
| F14.15-PR | Condições Operação Esterilizador |
| F34.01-PR | Controle de Lotes Bags Assépticos |
| F10.01-CQ (FQ) | Análises Físico-Químicas por Lote |
| F10.01-CQ (MB) | Análises Microbiológicas por Lote |
| INT-LOTE | Gerador de Código de Lote |
| F01.20-CQ | Higienização e Sanitização (COP/CIP) |
| F31.01-CQ | Inspeção de Funcionamento das Cortinas de Ar |
| F41.01-LI | Limpeza dos Laboratórios, Contra-amostra e Segregado |
| F03.11-CQ | Monitoramento do Sistema de Ozônio na Sanitização da Fruta |
| F03.12-CQ | Monitoramento do Ácido Peracético na Sanitização da Fruta |
| F02.05-CQ | Verificação de Balança |
| F02.02-CQ | Verificação do pHmetro |
| F02.03-CQ | Verificação do Refratômetro |
| F02.10-CQ | Verificação da Temperatura das Geladeiras e Marmiteiros |
| F01.21-CQ | Registro do pH da Água de Entrada e Saída da Caldeira |
| F01.07-CQ | Entrega de Etiquetas para Rotulagem dos Tambores |
| F01.08-CQ | Análise de Água |
| F01.09-CQ | Tratamento de Água |
| COA | Certificado de Análises |
| CAD-FRUTA | Cadastro de Frutas |

## Gestão de usuários

A gestão de usuários fica em:

```text
Configurações > Usuários e acessos
```

Nessa tela é possível:

- listar usuários;
- criar usuário;
- editar nome, login, senha e perfil;
- excluir usuários, exceto o login `admin`;
- definir permissões de formulários para operadores.

Para operadores, cada formulário precisa ser liberado individualmente. Para `ADMIN` e `ADMIN_TI`, o sistema considera acesso total.

## Logs de atividade

O sistema registra eventos em `activity_logs`.

Tipos de log:

- `Acesso`: login e logout.
- `Formulário`: criação e edição de registros.
- `Gestão`: exportação, usuários e ações administrativas.

Se a gravação remota do log falhar, há um fallback local no `localStorage`, limitado aos últimos 50 logs.

## Banco de dados

### Tabelas base

O script `init.sql` cria as tabelas:

- `records`: tabela genérica de registros.
- `activity_logs`: logs do sistema.
- `users`: usuários, senhas, perfis e permissões.
- `fruits`: cadastro simples de frutas.

### Tabelas por formulário

Além das tabelas base, o banco possui uma tabela especializada para cada formulário. O nome da tabela é gerado substituindo hífens por underscores.

Exemplos:

```text
fruit-discharge      -> fruit_discharge
batch-generation     -> batch_generation
water-treatment      -> water_treatment
```

Cada tabela especializada segue a estrutura principal:

```sql
id UUID PRIMARY KEY,
user_id TEXT,
user_name TEXT,
timestamp TIMESTAMPTZ DEFAULT NOW(),
data JSONB,
sync_status TEXT DEFAULT 'synced'
```

### View unificada

A view `view_all_records` une os registros das tabelas especializadas e permite que relatórios e sincronização busquem tudo em um único endpoint.

Essa view é essencial para:

- carregar histórico geral;
- sincronizar dados remotos para IndexedDB;
- exportar todos os registros;
- alimentar relatórios e indicadores.

## API Backend

O backend fica em `backend/server.js` e roda com Express.

Porta padrão:

```text
3001
```

Se a variável `PORT` existir, ela substitui a porta padrão.

### Endpoints principais

| Método | Rota | Função |
| --- | --- | --- |
| GET | `/api/view_all_records` | Busca todos os registros pela view agregada. |
| GET | `/api/:table` | Lista registros de uma tabela, com filtros simples. |
| POST | `/api/:table` | Insere registro em uma tabela. |
| PUT | `/api/:table/:id` | Atualiza registro por ID. |
| DELETE | `/api/:table/:id` | Exclui registro por ID. |
| DELETE | `/api/:table` | Exclui todos os registros da tabela. |

### Filtros da API

O endpoint `GET /api/:table` aceita parâmetros simples:

```text
?username=admin
?order=name&orderDirection=asc
?limit=10
```

O backend monta a query SQL dinamicamente com base nos parâmetros informados.

### Normalização de dados

O backend normaliza:

- colunas JSONB, como `permissions`, `data`, `fotos`;
- campos numéricos;
- campos inteiros;
- campos de data/hora;
- payload específico de `chkmatp_qualidade`.

Payloads grandes são permitidos até `50mb`, principalmente por causa de imagens em base64.

## Configuração de ambiente

### Frontend

O frontend usa a variável:

```env
VITE_API_URL=http://192.168.241.199:3001/api
```

Se ela não estiver definida, o sistema usa:

```text
http://<host_atual>:3002/api
```

Observação: no backend atual, a porta padrão é `3001`. Garanta que `VITE_API_URL` aponte para o backend correto.

### Backend

Crie um arquivo `backend/.env` com as credenciais do PostgreSQL:

```env
PORT=3001
DB_USER=admin
DB_HOST=localhost
DB_NAME=sgq_db
DB_PASSWORD=adminpassword
DB_PORT=5432
```

## Como executar em desenvolvimento

### 1. Instalar dependências do frontend

```bash
npm install
```

### 2. Instalar dependências do backend

```bash
cd backend
npm install
```

### 3. Subir banco PostgreSQL local com Docker

Na raiz do projeto:

```bash
docker compose up -d
```

O `docker-compose.yml` cria:

- container: `sgq_postgres`;
- banco: `sgq_db`;
- usuário: `admin`;
- senha: `adminpassword`;
- porta: `5432`;
- execução automática do `init.sql`.

### 4. Iniciar backend

```bash
cd backend
npm run dev
```

Ou em modo normal:

```bash
npm start
```

### 5. Iniciar frontend

Na raiz do projeto:

```bash
npm run dev
```

O frontend inicia em:

```text
http://localhost:3000
```

## Scripts disponíveis

Na raiz:

| Script | Função |
| --- | --- |
| `npm run dev` | Inicia o frontend Vite em `0.0.0.0:3000`. |
| `npm run build` | Executa TypeScript e gera build de produção. |
| `npm run preview` | Serve o build localmente na porta `3000`. |
| `npm run lint` | Executa `tsc --noEmit` para validação TypeScript. |

No backend:

| Script | Função |
| --- | --- |
| `npm start` | Inicia `server.js`. |
| `npm run dev` | Inicia `server.js` com `node --watch`. |

## Build e publicação

Para gerar a versão de produção:

```bash
npm run build
```

O build é gerado na pasta:

```text
dist/
```

O projeto também possui:

- `nginx-sgq.conf`: exemplo de configuração Nginx.
- `backend/app.js`: entrada compatível com Passenger/Localweb.
- `vercel.json`: configuração de publicação para ambientes compatíveis com Vercel.

## PWA e instalação no dispositivo

O sistema é configurado como PWA com:

- nome: `Via Néctare SGQ`;
- nome curto: `VN SGQ`;
- ícones `gota.png`;
- cache de assets;
- atualização automática de service worker.

Em navegadores compatíveis, o usuário pode instalar o SGQ como aplicativo no computador ou celular.

## Consulta de lote por QR Code

O formulário `Gerador de Código de Lote` pode gerar QR Code.

O QR Code aponta para uma URL com parâmetro:

```text
?lote=<codigo_do_lote>
```

Ao abrir essa URL, o sistema:

1. faz login se necessário;
2. navega para relatórios;
3. filtra pelo formulário de geração de lote;
4. busca o código informado;
5. abre o registro correspondente quando encontrado.

## Recomendações de uso

- Sempre confira se há itens pendentes antes de limpar cache ou trocar de navegador.
- Evite fechar o navegador durante exportações grandes.
- Use o botão `Sincronizar` quando aparecer fila pendente.
- Para operadores, revise permissões sempre que um novo formulário for criado.
- Para auditoria, consulte os logs após alterações administrativas.
- Para relatórios oficiais, visualize o registro e use `Imprimir PDF`.

## Manutenção e evolução

### Adicionar novo formulário

Fluxo recomendado:

1. Criar o componente em `components/forms`.
2. Adicionar o tipo em `types.ts`.
3. Adicionar metadata em `constants.tsx`.
4. Registrar o componente no `switch` de `FormContainer.tsx`.
5. Criar a tabela correspondente no banco.
6. Incluir a tabela na view `view_all_records`.
7. Liberar permissões para usuários operadores.
8. Testar criação, edição, relatório, exportação e sincronização offline.

### Alterar permissões

As permissões são armazenadas em `users.permissions` como JSON.

Exemplo:

```json
["fruit-discharge", "fruit-intake", "batch-generation"]
```

O frontend normaliza permissões vindas como array, JSON em texto ou lista separada por vírgulas.

### Cuidados com banco

- A view `view_all_records` precisa estar atualizada com todas as tabelas de formulários.
- Cada tabela especializada precisa aceitar pelo menos `id`, `user_id`, `user_name`, `timestamp`, `data` e `sync_status`.
- Mudanças de nome em `FormType` impactam tabelas, permissões, relatórios e sincronização.

## Usuário inicial

O `init.sql` cria um usuário inicial:

```text
Login: admin
Senha: admin123
Perfil: ADMIN
```

Recomendação: alterar a senha padrão após a primeira configuração em ambiente real.

## Observações importantes de segurança

- As senhas estão armazenadas em texto no banco atual.
- Para uso em produção, recomenda-se implementar hash de senha no backend.
- A API possui endpoints genéricos por tabela; em ambiente público, recomenda-se adicionar autenticação, autorização e validação de nomes de tabela.
- O CORS está liberado de forma ampla no backend.
- As políticas de banco e acesso devem ser revisadas antes de exposição externa.

## Resolução de problemas

### Login informa falha de conexão

Verifique:

- backend está rodando;
- `VITE_API_URL` aponta para a porta correta;
- banco PostgreSQL está acessível;
- arquivo `backend/.env` está configurado.

### Relatórios não carregam registros

Verifique:

- existência da view `view_all_records`;
- tabelas especializadas criadas;
- registros gravados nas tabelas corretas;
- console do backend para erros SQL.

### Registro fica pendente

Possíveis causas:

- navegador offline;
- API indisponível;
- erro no banco;
- tabela do formulário inexistente;
- view ou estrutura de tabela desatualizada.

Quando a conexão voltar, use `Sincronizar`.

### Exportação vazia

Verifique filtros de formulário, data e pesquisa. Se não houver registros para o critério selecionado, o sistema informa que nenhum dado foi encontrado.

### Formulário não aparece para operador

Verifique as permissões do usuário em:

```text
Configurações > Usuários e acessos
```

Administradores veem todos os formulários; operadores dependem de liberação individual.