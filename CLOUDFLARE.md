# Compartilhar as fotos dos veículos na Cloudflare

O projeto está configurado para Cloudflare Workers com arquivos estáticos e uma API no mesmo Worker. Essa opção funciona no plano gratuito e mantém o site no Worker atual. O binding R2 guarda as fotos; o D1 guarda a ordem compartilhada.

## Configuração inicial

1. No Cloudflare, abra o D1 `rickautomoveis-db` e copie o **Database ID**.
2. No arquivo `wrangler.jsonc`, substitua `COLE_AQUI_O_ID_DO_BANCO_D1` pelo ID copiado. Confira também se o campo `name` é exatamente o nome do Worker que já atende o domínio do site; mantenha esse nome para não publicar outro Worker por engano.
3. No terminal, autentique o Wrangler e aplique a migração no banco remoto:

   ```powershell
   pnpm exec wrangler login
   pnpm exec wrangler d1 execute rickautomoveis-db --remote --file=migrations/0001_vehicle_images.sql
   ```

4. Crie os segredos do Worker. Use uma senha nova e forte para o painel:

   ```powershell
   pnpm exec wrangler secret put ADMIN_PASSWORD
   pnpm exec wrangler secret put SESSION_SECRET
   ```

   O Wrangler solicitará cada valor sem exibi-lo no terminal. O e-mail `admin@rickautomoveis.com.br` é o padrão; para trocá-lo, configure também `ADMIN_EMAIL` como secret.
5. Publique a aplicação:

   ```powershell
   pnpm install
   pnpm deploy:cloudflare
   ```

O `wrangler.jsonc` conecta o binding `DB` ao banco e `VEHICLE_IMAGES` ao bucket R2 `rickautomoveis-images`. Não é necessário adicionar variáveis pelo painel de um Worker que contém apenas recursos estáticos: o deploy com o ponto de entrada `functions/worker.ts` cria um Worker com código e bindings.

Depois de configurar este Worker, publique atualizações com `pnpm deploy:cloudflare`. Não use o deploy estático do Figma Make para este projeto, pois ele pode substituir o Worker e remover o código da API. O uso permanece no plano gratuito enquanto estiver dentro das cotas gratuitas vigentes da Cloudflare.

Depois da publicação, entre no painel, reorganize as fotos e salve o veículo. A primeira foto permanece como capa. A ordem e as imagens salvas são compartilhadas com todos os visitantes em desktop e celular.
