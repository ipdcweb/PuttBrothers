# Putt Brothers: retirada completa das dependências AWS

Solicitado por Rafael em 23 de outubro de 2026, após a migração do catálogo/3D.

## Execução

1. Substituir o upload S3 por armazenamento nativo R2 e URLs próprias do site.
2. Retirar SDK, configuração e código opcional de integração AWS da aplicação.
3. Migrar o backend da produção mantendo sua aparência V1, o WorkOrg e os oito
   caminhos de domínio atuais. A revisão V2 segue em seu Worker separado.
4. Conferir catálogo, imagens, dez modelos Unity e armazenamento de PDF antes e
   depois da publicação. Preservar a versão anterior para recuperação.
5. Com acesso autenticado à conta AWS, inventariar todos os recursos atribuíveis
   à Putt Brothers, copiar conteúdo adicional e PDFs históricos e tratar seus
   links. Somente então preparar a exclusão dos alvos identificados.

## Recursos conhecidos e isolamento

- Produção Cloudflare: `puttbrothers-com`, conta
  `5929fdac0cd2d82d7378551cf4c20774`. Versão anterior:
  `7193bac3-40e3-4d83-b8f3-006e6bdcb91a`.
- Fonte isolada de produção: `../WebsiteLocal_AwsRetirement`, branch
  `aws-retirement-production`. A pasta original V1 e suas alterações locais
  permanecem preservadas.
- R2 de mídia: `puttbrothers-product-media-production`, prefixo
  `catalog-20261023-v1`, 198 arquivos / 409.833.999 bytes, todos confirmados por
  download, tamanho, MIME e SHA-256.
- PDFs: bucket privado `puttbrothers-layout-pdfs-production`; revisão usa
  `puttbrothers-layout-pdfs-review`. Os links novos são
  `/layout-pdfs/YYYY/MM/<UUID>.pdf`, sem e-mail no nome da chave.
- Origem AWS conhecida de mídia: `puttbrothers-images`, região
  `ap-southeast-2`. API pública antiga: `va0d7iedl5`, mesma região.
- Nomes de Secrets existentes de produção, valores não lidos: `AWS_ACCESS_KEY_ID`,
  `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `LAYOUT_PDF_BUCKET`,
  `LAYOUT_PDF_PUBLIC_BASE_URL` e `WORKORG_API_TOKEN`.
- Preservar `WORKORG_API_TOKEN`. Segredos AWS obsoletos só serão removidos do
  Worker após a publicação e os testes da substituição.

## PDFs e contratos preservados

O upload continua devolvendo `success`, `url`, `key`, `filename`; o planner e o
formulário continuam usando `layoutPdfUrl` e o mesmo JSON WorkOrg/`FindLead`.
O campo de evento legado `s3Url` permanece como compatibilidade, contendo a URL
Cloudflare. Não há envio de lead real durante testes.

O upload exige origem igual, multipart com exatamente um PDF, assinatura `%PDF-`,
limite de 10 MiB e limitador de frequência. Corpo multipart é lido com limite de
12 MiB. Downloads têm UUID, R2 privado, cabeçalhos sem cache, `noindex`, `nosniff`
e sem referrer. Não há endpoint público de listagem/exclusão de PDFs.

## Conteúdo antigo antes da exclusão

Os 198 arquivos representam os usados atualmente pelo website, não um inventário
integral da conta ou do bucket AWS, cuja listagem pública é bloqueada. Não presumir
que não existam outros arquivos, versões, bancos, funções ou serviços cobrados.

URLs históricas hospedadas em `amazonaws.com` não podem ser redirecionadas pelo
Cloudflare. É necessário inventariar PDFs e referências salvas no WorkOrg antes
de apagar seus objetos. Links de e-mails já enviados também precisam de decisão.
Inventários com dados de clientes ficam fora do Git público.

## Verificação até aqui

- V2: 56 testes passaram, incluindo os contratos de contato e nove testes PDF.
- Vinext V2 compilou com sucesso; tipagem retém apenas dois erros preexistentes
  de `CacheStorage.default`, sem novo erro do armazenamento PDF.
- Teste nativo Miniflare/R2/limitador passou em `2026-10-22T20:05:16.396Z`:
  PDF sintético de 3.215 bytes, upload 200, download 200 com bytes idênticos,
  HEAD 200, Range 206 e origem externa bloqueada. Nenhuma chamada externa.
- SDK AWS removido, junto com 47 pacotes desnecessários; demais versões mantidas.
- Rafael forneceu a sessão AWS autenticada. A leitura do IAM confirmou a conta
  `590183868691`, ipdc Limited. Nenhuma configuração de MFA, chave ou permissão
  foi alterada. A listagem de objetos ainda não foi concluída: a conexão de
  automação do navegador caiu ao navegar para S3. A aba existente mostra o bucket
  `puttbrothers-images` em Sydney; retomar por essa sessão, sem pedir senhas.
  Não há perfil/CLI AWS local, e Secrets do Worker não foram exportados.
- Nenhum recurso AWS foi excluído nesta preparação.

## Estado publicado para revisão, registro anterior à aprovação

A V2 foi publicada em https://puttbrothers-v2-preview.team-web-592.workers.dev/,
fonte `2f78bc9`, versão `9311c4a5-95b3-4a9e-9795-94501f6f6ebb`.
Check geral público passou em `2026-10-22T20:17:49.118Z` e check de todas as mídias
em `2026-10-22T20:17:51.907Z`. Contato e upload PDF permanecem bloqueados no
preview; o novo armazenamento PDF foi verificado isoladamente com arquivo sintético.

A produção V1 está preparada na branch `aws-retirement-production`, mas não foi
atualizada. A cópia temporária isolada dessa branch foi publicada sem rotas:
`puttbrothers-aws-retirement-review`, versão `4ebcb2f5-58cb-4a9b-9053-4a1980bd4e31`.
O link que Rafael pediu para revisar continua sendo o V2 acima.

A última instrução de Rafael estabelece a ordem: publicar as alterações na V2,
permitir sua revisão e então parar com a AWS. Portanto, aguardar sua revisão antes
de promover a produção, apagar recursos AWS ou remover credenciais antigas.
Nenhum recurso AWS nem Secret de produção foi removido.

## Etapa autorizada após a aprovação, 23 de outubro de 2026

Rafael confirmou que a revisão V2 funciona, incluindo a navegação individual e
os WebP de 300 px no celular, e pediu parar o serviço AWS para testar antes de
cancelar. Essa etapa autoriza uma parada reversível; não exclui dados nem cancela
planos. A interface V2 permanece na prévia, sem promoção do redesign.

- O domínio oficial ainda usava AWS na auditoria inicial. Foi publicado somente
  o backend V1 preparado, fonte `cbd3ea0`, versão Cloudflare
  `62af4949-e440-4891-ad43-819665e83830`. Os oito caminhos, seis Secrets existentes,
  formulário WorkOrg e aparência V1 foram preservados. Não houve alteração DNS.
- Antes da parada: 40 testes e build passaram; catálogo 39 e planner 30 identificam
  origem Cloudflare. As 198 mídias R2, dez HTML Unity e vinte Range WASM/data,
  hashes de imagens, aliases e compatibilidade de imagens antigas passaram.
  Chrome abriu o 3D Rack'Em Up, inicializou Unity sem erro e sem chamadas AWS.
- Inventário autenticado na conta `590183868691`: Lightsail não mostra instâncias
  nem bancos. RDS Sydney tem `database-puttbrothers`, SQL Server Express Edition,
  classe `db.t3.small`, Single-AZ `ap-southeast-2c`, inicialmente `Available`.
  Backups automáticos habilitados (retenção de um dia), três snapshots disponíveis
  e último ponto de restauração observado em 23/10/2026 às 07:40 de Brisbane.
- S3 tem quatro buckets: `puttbrothers-api-dev-serverlessdeploymentbucket-llgusddubyyi`,
  `puttbrothers-app`, `puttbrothers-images`, `puttbrothers-layout-pdfs-prod`.
  Mídia possui itens adicionais fora do catálogo migrado; PDFs históricos existem
  sob `layout-plans/2026/`. Todos permanecem preservados e acessíveis como antes.
- A única mutação AWS desta etapa é RDS **Stop temporarily** para
  `database-puttbrothers`. Depois de `Stopping`, o console confirmou
  **Stopped temporarily** em 23/10/2026, aproximadamente às 07:57 de Brisbane.
  O aviso de confirmação informa reinício automático em **30/10/2026 às 07:49**
  de Brisbane. Comprovante local: `tmp/aws-rds-stopped-20261023.png`, fora do Git.
- Parar RDS preserva dados/configuração e permite **Actions > Start**. A AWS
  reinicia automaticamente após sete dias; armazenamento e backups continuam
  sujeitos a cobrança. Não prometer fatura zerada durante a pausa.
- S3, Lambda, API Gateway, IAM, credenciais e conta não foram desativados ou
  excluídos. O fechamento financeiro permanece para depois da validação humana.
- Depois do estado parado, oficial e prévia passaram novamente: cinco páginas,
  catálogo 39, planner 30, 198 mídias R2 com HEAD/MIME/bytes/hash por site, dez
  entradas HTML Unity, vinte Range WASM/data por site, imagens/exportação do
  planner e sete aliases oficiais. Apenas GET/HEAD, sem lead ou PDF enviado.
  Evidência: `../WebsiteLocal_AwsRetirement/tmp/post-rds-stop-check.json`,
  execução em 23/10/2026 às 07:57 de Brisbane.
- Chrome oficial inicializou o modelo Bridge após a parada, com canvas ativo,
  carregamento concluído, sem aviso de erro nem recurso AWS. No preview mobile,
  Bridge `33 / 39` avançou para Bulls Eye `34 / 39`, com WebP de 300px, catálogo
  Cloudflare e autoplay desligado. Nenhum erro de aplicação observado no console.
- A validação humana final continua antes de cancelar: abrir imagens/3D no celular,
  testar o planejador e, pelo próprio Rafael, um envio real do formulário/PDF.
  Documentação de produção e evidências da pausa: commit `0be7be0` na branch
  `aws-retirement-production`. Rollback exige **Actions > Start** no RDS antes de
  restaurar a versão antiga do Worker; o início do banco não é instantâneo.
