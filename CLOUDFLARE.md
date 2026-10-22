# Compartilhamento das fotos dos veículos

O catálogo inicial do site continua sendo carregado pelo aplicativo. A ordem definida no painel e as fotos enviadas são compartilhadas pela Cloudflare Pages Function, D1 e R2.

## Configuração

1. No painel Cloudflare, abra o projeto Pages do site.
2. Crie um banco D1 e aplique `migrations/0001_vehicle_images.sql`.
3. Crie um bucket R2.
4. Em **Settings → Functions → Bindings**, adicione:
   - D1 database: variável `DB`, apontando para o banco criado.
   - R2 bucket: variável `VEHICLE_IMAGES`, apontando para o bucket criado.
5. Em **Settings → Variables and Secrets**, configure:
   - `ADMIN_EMAIL`: e-mail usado no painel (padrão: `admin@rickautomoveis.com.br`).
   - `ADMIN_PASSWORD`: uma senha nova e forte para o painel.
   - `SESSION_SECRET`: um segredo aleatório longo, diferente da senha.
6. Faça um novo deploy do projeto Pages. As Functions ficam na pasta `functions/`.

Para gerar um segredo localmente no PowerShell: `$bytes = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); [BitConverter]::ToString($bytes).Replace("-", "").ToLowerInvariant()`.

Depois do deploy, entre no painel normalmente, organize as fotos e salve o veículo. A primeira foto continuará sendo a capa. As fotos públicas são servidas pela própria Function e funcionam tanto no desktop quanto no celular.

O login anterior era validado apenas no navegador. Com esta integração, o acesso e o salvamento de fotos são validados no servidor; configure a senha e o segredo acima antes de usar o painel publicado.
