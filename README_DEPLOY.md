# Onebridge Alliance — Deploy & Segurança

Este projeto é um site estático (HTML/CSS/JS) com duas funções serverless em
`/api/`. As integrações sensíveis (SignWell, Make.com) **não rodam mais no
navegador** — o front-end chama as rotas serverless e elas falam com os
provedores usando variáveis de ambiente.

---

## 1. Variáveis de ambiente

Configure as três variáveis abaixo em **Vercel → Project → Settings →
Environment Variables** (Production, Preview e Development).

| Variável | Onde é usada | Origem |
| --- | --- | --- |
| `SIGNWELL_API_KEY` | `api/signwell-document.js` | painel SignWell → API Settings |
| `SIGNWELL_TEMPLATE_ID` | `api/signwell-document.js` | painel SignWell → Templates |
| `MAKE_NCNDA_WEBHOOK_URL` | `api/ncnda.js` | cenário Make.com → módulo Webhook |

Para desenvolvimento local, copie `.env.example` para `.env` e preencha os
valores. O `.env` já está em `.gitignore`.

---

## 2. AÇÃO IMEDIATA — revogar a chave antiga da SignWell

A chave abaixo foi commitada em `js/main.js` no histórico público e deve ser
considerada comprometida:

```
SIGNWELL_API_KEY = YWNjZXNzOmFkMTAwZGRiMDhjNWZlMjhhOWZjNzM5ZGY2YjM1OGJl
                 = access:ad100ddb08c5fe28a9fc739df6b358be (base64-decoded)
```

**Passos obrigatórios:**

1. Entre em [https://www.signwell.com/](https://www.signwell.com/) → API
   Settings.
2. **Revogue/regenere** a chave acima.
3. Copie a nova chave para `SIGNWELL_API_KEY` no painel da Vercel.
4. (Opcional, recomendado) Audite o painel SignWell por documentos criados
   sem autorização entre fevereiro/2026 e a data da revogação.

> O webhook do Make.com (`hook.us2.make.com/...`) também esteve público no
> repositório. Considere rotacioná-lo gerando um novo webhook no cenário e
> atualizando `MAKE_NCNDA_WEBHOOK_URL` na Vercel — o webhook antigo pode ser
> abusado por terceiros que copiaram a URL antes da remoção.

---

## 3. Deploy na Vercel

1. Push para a branch principal (`main`). A Vercel já está conectada ao repo
   `wdangelousa/onebridgealliance.com`.
2. Garanta que as três variáveis de ambiente estejam definidas **antes** do
   build, senão as rotas `/api/*` vão responder 500 com mensagem clara.
3. Não há build step — Vercel detecta o site estático e expõe `/api/*.js`
   como Serverless Functions automaticamente (Node 20+).

---

## 4. Rodando localmente

Opção A — site estático puro (sem testar `/api/*`):

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Opção B — com as rotas serverless funcionando (recomendado):

```bash
npm install -g vercel
vercel dev
# abra http://localhost:3000
```

Para `vercel dev` funcionar, o `.env` local precisa ter as três variáveis
preenchidas (ou use `vercel env pull` para baixar do projeto).

---

## 5. Como testar — formulário NCNDA

1. Abra o site → aba **Contrato** → seção "Termo de Adesão e
   Confidencialidade".
2. Preencha **Nome Completo** e **E-mail Corporativo**, marque o checkbox
   e envie.
3. Resultado esperado:
    - Front-end faz `POST /api/ncnda` com `{ partner_name, email, status }`.
    - A função serverless valida os campos, adiciona `submitted_at` e
      `source`, e repassa para `MAKE_NCNDA_WEBHOOK_URL`.
    - O Make.com dispara o e-mail de boas-vindas.
    - A UI mostra "Framework de Parceria Registrado com Sucesso!".
4. Como diagnosticar falhas:
    - **Vercel Logs** (`Functions → /api/ncnda`) mostram a resposta do
      upstream.
    - Se `MAKE_NCNDA_WEBHOOK_URL` estiver vazia, a rota responde 500 com
      mensagem explícita.
    - Em caso de 502, o webhook do Make.com falhou — abra o cenário e veja
      a aba *History*.

Smoke test via `curl`:

```bash
curl -X POST http://localhost:3000/api/ncnda \
  -H 'Content-Type: application/json' \
  -d '{"partner_name":"Teste","email":"teste@firma.com"}'
# esperado: {"ok":true}
```

---

## 6. Como testar — integração SignWell

> Não há, neste momento, formulário visível na UI que dispare
> `/api/signwell-document`. O endpoint existe pronto para uso quando o fluxo
> de assinatura embedded for reativado. Para validar a integração:

```bash
curl -X POST http://localhost:3000/api/signwell-document \
  -H 'Content-Type: application/json' \
  -d '{
    "partner_name": "Teste",
    "partner_email": "teste@firma.com",
    "partner_company": "Firma LLC",
    "partner_country": "Brasil",
    "test_mode": true
  }'
```

Resposta esperada (com `test_mode: true` para não consumir crédito real):

```json
{
  "ok": true,
  "document_id": "doc_xxx",
  "embedded_signing_url": "https://www.signwell.com/embed/..."
}
```

Erros comuns:
- `500` com mensagem `SIGNWELL_API_KEY is not set` → variável faltando na
  Vercel.
- `500` com mensagem `SIGNWELL_TEMPLATE_ID is not set and no template_id was
  provided` → defina a variável ou passe `template_id` no payload.
- `502` com `error` da SignWell → cheque os `template_fields` configurados
  no template do painel; eles precisam bater com `Name`, `Company`,
  `Country`, `TaxID`, `Address`.

---

## 7. Pendências e riscos conhecidos

- **`GEMINI_API_KEY` no `.env` local** — não é commitada, mas como a chave
  da SignWell foi exposta, recomenda-se revisar todas as chaves do projeto e
  considerar rotação preventiva.
- **`automation_docs.md`** ainda contém o template de e-mail completo. A URL
  do webhook foi removida; se preferir, mova esse documento para um repo
  privado.
- **Histórico do git** ainda contém a chave SignWell antiga em commits
  anteriores (`js/main.js`). Remoção do histórico exige `git filter-repo`
  ou recriação do repo. **Mais importante é revogar a chave** do que
  reescrever o histórico — depois de revogada, a chave no histórico é
  inútil.
- O endpoint `/api/signwell-document` aceita `test_mode` no payload. Em
  produção, garanta que o front-end **não** envie `test_mode: true`.
- Não há rate limiting nas rotas serverless. Se o formulário começar a ser
  abusado, considere adicionar Vercel WAF ou um middleware de rate limit
  (Upstash Ratelimit, por exemplo).
