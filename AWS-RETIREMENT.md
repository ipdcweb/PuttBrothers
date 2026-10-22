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
- Acesso AWS ainda depende de login do usuário. Não há perfil/CLI AWS configurado
  nesta máquina, e Secrets de produção não são exportáveis pela API Cloudflare.
- Nenhum recurso AWS foi excluído nesta preparação.

Publicações e verificações finais serão registradas após sua conclusão.
