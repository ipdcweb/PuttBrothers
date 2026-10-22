# Migração do catálogo e 3D para Cloudflare

Data: 23 de outubro de 2026. Projeto: Putt Brothers, V2, branch `website-v2`.

## Viabilidade e decisão

O visualizador é um build Unity WebGL executado pelo navegador. A AWS fornece os
arquivos, as imagens e o JSON do catálogo; não calcula a interação 3D em servidor.
Podemos preservar os builds e a interface existentes e mudar somente a origem.

O inventário confirmou 39 máquinas e 10 builds Unity publicados. O planejador usa
30 máquinas com dimensões válidas. O arquivo de dados do modelo BRIDGE tem
37.884.245 bytes, acima do limite de 25 MiB de Workers Static Assets. A mídia será
armazenada no R2, com streaming pelo Worker existente.

Referências: [limites de Workers](https://developers.cloudflare.com/workers/platform/limits/),
[API R2 para Workers](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/),
[configuração de servidor Unity WebGL](https://docs.unity3d.com/Manual/webgl-server-configuration-code-samples.html).

## Plano de implementação

1. Capturar o catálogo integral, IDs, textos e dimensões em `lib/catalog/machines.json`.
2. Copiar as duas imagens de cada máquina e todas as dependências referenciadas
   pelos 10 builds Unity. Registrar URL de origem, tamanho e SHA-256 no manifesto.
3. Guardar os arquivos em um bucket R2 privado, exclusivo da revisão:
   `puttbrothers-product-media-review`, prefixo `catalog-20261023-v1`.
4. Servir `/product-media/<pasta>/...` pelo Worker com lista explícita de arquivos,
   MIME correto, ETag, HEAD e Range. O navegador deixa de acessar S3.
5. Substituir a consulta Lambda por catálogo versionado no site, mantendo a API,
   a paginação, os botões 3D e os dados do planejador. Converter URLs antigas do
   planejador para caminhos locais, sem permitir proxy de hosts arbitrários.
6. Validar integridade das cópias, testes, compilação Vinext e navegação real.
   Publicar primeiro no endereço V2 já autorizado, sem domínio ou DNS.
7. Rafael revisa as imagens, a abertura do 3D, rotação/zoom e o planejador.
   A promoção ao domínio oficial permanece uma ação separada.

## Escopo e operação

- V1, produção, DNS e arquivos AWS são preservados. Nenhum serviço AWS será
  apagado ou cancelado automaticamente.
- O catálogo passa a ser atualizado pelo JSON versionado, seguido de build e
  publicação. Mudanças futuras na antiga API AWS deixam de aparecer na V2.
- Os builds Unity originais e imagens PNG são preservados byte a byte. A migração
  não introduz um novo renderizador 3D ou muda o suporte atual a celulares.
- O bucket é privado; somente os caminhos do manifesto são expostos. O Worker
  oferece leitura, sem endpoint público de gravação ou listagem.
- Scripts de importação e sincronização verificam hashes. Arquivos volumosos
  ficam em `tmp/product-media`, fora do Git; manifesto e catálogo ficam no Git.
- O upload de PDF do formulário ainda contém uma integração AWS separada. Ela
  não faz parte do carrossel/3D e continua bloqueada no preview. A retirada total
  da conta AWS exige migrar esse fluxo e a produção também.

## Comandos e recuperação

Os scripts de mídia têm destinos restritos. Consulte `--help`/código antes de
alterar o prefixo de release. A importação é uma operação explícita; o site não
recorre à AWS quando o armazenamento Cloudflare falha.

- `node scripts/import-product-media.mjs --download`: captura/cópia da origem.
- `node scripts/import-product-media.mjs --verify`: verifica cópias locais.
- `node scripts/sync-product-media.mjs`: planejamento sem gravar.
- `node scripts/sync-product-media.mjs --local`: prepara o armazenamento local.
- `node scripts/sync-product-media.mjs --remote`: sincroniza o bucket de revisão.
- `pnpm test` e `pnpm run build:vinext`: verificações técnicas.
- `pnpm run deploy:preview`: publicação protegida, após commit e push da V2.

Rollback: restaurar a versão anterior do Worker V2
`ff0eca5c-545b-4e73-b993-fee532bcff8e` e o código anterior registrado em
`PREVIEW-RELEASE.md`. Não é necessário excluir o bucket ou mexer na produção.

## Resultado e evidências

- 198 arquivos, 409.833.999 bytes, 78 imagens PNG e 10 builds Unity completos.
- As cópias locais e o R2 local passaram na verificação integral de tamanho,
  MIME e SHA-256. Catálogo copiado sem alteração de valores.
- 47 testes passaram, incluindo os contratos anteriores de contato e preview.
- Build Vinext passou. Tipagem retém somente os dois erros preexistentes de
  `CacheStorage.default` nas partes antigas do Worker; nenhum novo erro.
  Lint direcionado: zero erros, avisos preexistentes nas áreas herdadas.
- `check-product-media.mjs --local` passou em `2026-10-22T19:32:56.940Z`:
  catálogo 39, planejador 30, todas as 198 rotas, MIME, HEAD, Range, hashes de
  arquivos pequenos, resolução de imagens antigas e bloqueio de hosts externos.
- Chrome local: BRIDGE e Rack'Em Up inicializaram o Unity, esconderam o indicador
  de carregamento e registraram o botão fullscreen, sem erro fatal. O botão do
  carrossel abriu o iframe na mesma origem; nenhuma dependência AWS foi carregada.
- Os builds antigos emitem avisos Unity de sincronização de persistência e um
  aviso WebGL `INVALID_ENUM` neste ambiente. Não impediram a inicialização.
- Aprovação visual/interação por Rafael permanece pendente. Publicação e
  conferência remota serão registradas abaixo quando concluídas.
