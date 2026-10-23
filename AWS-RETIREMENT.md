# Putt Brothers: migração Cloudflare e retirada da AWS

Estado final verificado em **23 de outubro de 2026, às 10:11 de Brisbane**.
Este registro substitui os estados intermediários de preparação e pausa.

**O website oficial funciona na Cloudflare e os recursos AWS da Putt Brothers
incluídos no inventário e no escopo aprovado foram excluídos. A conta AWS
permanece aberta por decisão expressa de Rafael; seu fechamento não está
pendente.** Isso não representa certificado de cobrança futura zerada.

## Website oficial e preview

- Oficial: [puttbrothers.com](https://puttbrothers.com). A V2 aprovada foi publicada
  em 23/10 às 08:11 de Brisbane, com código `f99da08`, na branch
  `website-v2-production`. As atualizações deste documento não publicam código.
- Foram mantidas as oito rotas dos domínios `.com`, `.ch`, `.de` e `.uk`, o
  domínio canônico `.com` e os sete redirecionamentos. Não houve alteração DNS.
  O formulário e seu contrato WorkOrg/`FindLead` foram preservados.
- Catálogo, imagens, dez builds Unity e armazenamento de novos PDFs usam
  Cloudflare. Mídia e PDFs ficam em R2 privado, acessíveis por URLs próprias
  do site. Os nomes e identificadores de infraestrutura ficam nos registros
  privados da operação.
- A publicação passou por 56 testes, verificação de 78 WebP do carousel, 198
  arquivos de mídia R2 e oito vídeos. No celular, os 39 produtos circulam
  individualmente nos dois sentidos, com WebP de 300 px; no desktop, 720 px.
- O [preview V2](https://puttbrothers-v2-preview.team-web-592.workers.dev/) permanece
  separado, com `noindex`, armazenamento de revisão e contato/upload PDF
  bloqueados. Seu código publicado continua `d28307b`; o ajuste de tipagem
  `ef3215f` e os commits posteriores de documentação não geraram outro deploy.

## Aplicativo antigo preservado

A cópia integral do código, das configurações e dos objetos recuperáveis foi
salva na pasta privada do aplicativo escolhida por Rafael no OneDrive. O arquivo
foi reconstruído, verificado integralmente e extraído. Nenhum código do aplicativo,
registro de cliente, variável de ambiente, objeto privado ou inventário detalhado
foi incluído no Git público do website.

| Evidência da preservação local | Resultado |
| --- | --- |
| Arquivo completo | 3.075.105.043 bytes |
| SHA-256 do arquivo | `98e4721e818eb913ef60d91aae520e7e6e861c35cf7b6ec30bdca66d27e48b82` |
| Extração verificada | 2.090 arquivos/membros |
| Objetos S3 preservados | 418 objetos, 719.160.718 bytes |
| Lambda preservado | 24 funções, 901 versões, 95 ZIPs únicos |
| Pacotes Lambda | 2.790.463.966 bytes |
| Fontes do backend recuperadas | 29 arquivos |

O recibo local registra validação e extração **PASS**. Código Lambda, metadados
de configuração, templates CloudFormation, exportações da API e objetos S3,
incluindo PDFs históricos, estão nessa preservação. Os comprovantes e a relação
exata dos recursos permanecem privados, fora deste repositório.
O pacote final de comprovantes também foi salvo nessa pasta privada e validado
localmente: 14 membros TAR, com todos os tamanhos e hashes conferidos, incluindo
as provas de ausência dos recursos e o inventário final sem resíduos.

Limites informados e aceitos antes da exclusão:

- **A interface mobile original não foi encontrada.** A inspeção dos 95 pacotes
  encontrou zero marcadores de UI mobile e 35 ocorrências de metadados `.expo`.
  Os 29 arquivos recuperados são fontes do backend; não constituem o aplicativo
  mobile completo.
- **Os registros SQL foram dispensados por Rafael.** Não foi feito BACPAC,
  `.bak` ou export desses dados. O banco foi excluído sem snapshot final e sem
  retenção de backups automáticos, conforme o escopo confirmado.
- **O disco raiz EC2 de 8 GiB não foi copiado nem convertido em imagem.** Rafael
  aceitou explicitamente seu descarte. A instância foi terminada e o volume
  excluído; o backup do aplicativo não representa uma imagem desse disco.
- O manifesto original foi capturado antes da dispensa dos registros SQL. Sua
  indicação histórica de backup de banco pendente foi mantida intacta para
  preservar os hashes; não representa uma pendência atual.

## Retirada AWS concluída no escopo aprovado

Depois da preservação local, houve uma pausa reversível, confirmada às 09:19.
Rafael então confirmou a exclusão permanente dos alvos apresentados, incluindo
o banco sem backup final, o disco EC2 sem cópia, o backend e os quatro buckets:
“Pode excluir tudo, vou finalizar todos os serviços com a AWS.”

As solicitações foram acompanhadas até a confirmação de ausência dos recursos.
O inventário final somente leitura cobriu as **17 regiões habilitadas**, com
`complete: true`, `observedRetired: true`, **zero erros, lacunas de cobertura ou
resíduos** nas categorias auditadas.

| Recurso do escopo aprovado | Resultado final observado |
| --- | --- |
| Banco RDS | Ausente |
| Backups automáticos e snapshots RDS | Zero |
| Instância EC2 | Terminada; apenas registro histórico, sem instância ativa |
| Volume raiz EBS de 8 GiB | Ausente |
| Volumes EBS e IPs elásticos cobertos pelo inventário | Zero |
| Quatro buckets S3 | Todos ausentes; 418 objetos preservados foram excluídos da origem |
| 24 funções Lambda e API antiga | Ausentes |
| Stack CloudFormation | `DELETE_COMPLETE`, identidade exata conferida em registro privado |
| Role IAM exclusiva do projeto | Ausente |
| Grupos de logs do projeto | Zero |

O IP elástico gerenciado pelo RDS desapareceu com a retirada do serviço; não foi
liberado manualmente como se pertencesse à instância NAT. O reinício automático
anteriormente anunciado para o banco parado não se aplica ao banco já excluído.

O executor normal recusou uma verificação posterior porque a resposta de um
stack já excluído omitiu o campo de proteção. O executor de exclusão e seu
baseline permaneceram intactos. Um verificador separado, somente leitura,
confirmou `DELETE_COMPLETE`, o inventário global recente e a ausência física dos
recursos. Ele apenas concluiu os comprovantes locais e preservou o diagnóstico
anterior; não executou exclusões adicionais.

A conta compartilhada permanece aberta conforme solicitado. Não foram
eliminados indiscriminadamente permissões ou recursos alheios à Putt Brothers.
O inventário descreve as categorias verificadas; não equivale à auditoria de
todos os serviços possíveis da AWS.

## Website verificado após as exclusões

O relatório local `tmp/post-aws-deletion-public-check.json` registra **24 de 24
verificações HTTP aprovadas**, distribuídas entre o oficial e o preview:

- Cinco páginas por site com HTTP 200. Oficial indexável e preview com `noindex`.
- Catálogo de 39 produtos e planner de 30 máquinas, ambos de origem Cloudflare,
  com imagens locais e dimensões válidas.
- WebP Bridge de 300 × 214 px, com tamanho e hash iguais ao manifesto.
- HTML e loader Unity Bridge disponíveis e íntegros; WASM/data com HTTP 206,
  Range e tipos corretos.

Essa checagem usou apenas GET, sem chamadas AWS, formulários ou PDFs enviados.
Não houve novo deploy. As verificações completas de 198 mídias e 78 WebP já
registradas na publicação não foram repetidas nessa checagem curta.

Na verificação anterior do navegador oficial desktop, Bridge iniciou com canvas
ativo, carregamento concluído e nenhum recurso AWS na página ou iframe. No
celular, a navegação voltou de 1 para 39 e avançou de 39 para 1 sem travamento.

**Limitação mobile preexistente:** abaixo de 720 px, uma regra CSS esconde o botão
3D, inclusive no modal. Não foi alterada nesta migração. A interação 3D pelo botão
no celular continua sem validação; a disponibilidade dos arquivos e o teste real
de interação no desktop foram confirmados.

## Cobrança e recuperação

O consumo anterior à exclusão ainda pode ser faturado. A conta foi mantida
aberta e nenhum recurso pago remanescente foi identificado no escopo auditado.
Isso não constitui uma confirmação de cobrança futura zerada.

Os PDFs históricos foram preservados localmente. Seus links antigos na AWS
deixam de funcionar após a exclusão dos objetos; a cópia local não redireciona
URLs anteriormente enviadas. Os novos PDFs usam URLs próprias da Cloudflare.

O rollback registrado do website restaura a interface V1 com backend Cloudflare,
sem necessidade de iniciar RDS. Não restaura os dados ou o disco AWS descartados.
O código atual continua na Cloudflare, com o preview separado para futuras
melhorias. Não há fechamento da conta AWS a executar.
