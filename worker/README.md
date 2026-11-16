# Worker da API de IA

O Worker recebe somente o tema personalizado, chama a API do Gemini e devolve até oito palavras filtradas. Usa `gemini-3.5-flash-lite`, modelo de baixa latência; nomes de jogadores não são enviados.

## Preparar a chave

1. Crie uma chave no Google AI Studio e confira no painel que o projeto está no nível gratuito e que o modelo configurado tem cota gratuita disponível. Não vincule faturamento nem selecione um projeto pago.
2. Para desenvolvimento local, crie `worker/.dev.vars` (esse arquivo é ignorado pelo Git) com:

   ```text
   GEMINI_API_KEY=sua_chave_local
   ```

3. Na raiz do app, defina `EXPO_PUBLIC_AI_WORKER_URL` no `.env`:

   - navegador: `http://localhost:8787/generate-words`
   - emulador Android: `http://10.0.2.2:8787/generate-words`
   - aparelho físico: use o endereço IP local do computador e mantenha os dois na mesma rede.

## Rodar localmente

Em um terminal:

```sh
cd worker
npm install
npm run dev
```

Em outro terminal, na raiz do projeto:

```sh
npx expo start --clear
```

O Worker local usa a chave de `worker/.dev.vars`; ela não deve ser colocada no `.env` do app.

## Publicar no Cloudflare Workers Free

O plano Workers Free inclui até 100 mil requisições por dia. A documentação não informa se o cadastro da conta exige cartão; se a interface solicitar método de pagamento ou ativação de plano pago, não prossiga. O plano pago tem cobrança mínima, e este projeto não precisa dele.

Se optar por publicar:

```sh
cd worker
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```

Cole a chave somente no prompt do comando de segredo. Depois, configure `EXPO_PUBLIC_AI_WORKER_URL` com a URL publicada terminada em `/generate-words`. A URL é pública; a chave do Gemini não é.

O limitador usa um identificador numérico em `wrangler.toml`. Se esse número já estiver ocupado na conta, troque-o por outro inteiro positivo que ainda não esteja em uso. O limite é aproximado por região do Cloudflare; pessoas na mesma rede podem compartilhar o limite por IP.

## Limites e privacidade

- O app aplica intervalo mínimo de 30 segundos entre pedidos na mesma sessão.
- O Worker limita até dez pedidos por minuto por IP e aceita temas de até 60 caracteres.
- Cada resposta contém no máximo oito palavras; erros e limites excedidos acionam o fallback do Firestore no app.
- O Gemini no nível gratuito pode usar conteúdo enviado para melhorar produtos do Google. O app envia apenas o tema, nunca nomes ou dados dos jogadores. Evite colocar dados pessoais no campo de tema.
- Não registre o corpo da requisição nem a chave em logs.
