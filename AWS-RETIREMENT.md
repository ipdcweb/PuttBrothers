# Putt Brothers: migração Cloudflare e retirada da AWS

Estado confirmado em **23 de outubro de 2026, aproximadamente às 09:19 de
Brisbane**. Este documento substitui os relatos intermediários da migração.

**A V2 já está no domínio oficial. A pausa dos serviços de execução AWS foi
confirmada; a conta continua aberta.** No registro da pausa, nenhum recurso
havia sido excluído. Rafael autorizou posteriormente as exclusões permanentes
apresentadas, mas sua conclusão depende dos comprovantes de execução e da
conferência dos recursos restantes. Armazenamento ainda pode gerar cobrança.

## Website oficial e preview

- Oficial: [puttbrothers.com](https://puttbrothers.com).
  Fonte publicada `f99da081dedcd232b682760553c20f0a8983c62f`, versão
  `33587fb3-21dd-4055-80fc-f4ca72406f87`, publicada em 23/10 às 08:11 de Brisbane.
  Fonte e documentação ficam em `../WebsiteLocal_V2Production`, branch
  `website-v2-production`, com registro de documentação `e85a4d1`.
- Foram mantidas as oito rotas dos domínios `.com`, `.ch`, `.de` e `.uk`, o
  domínio canônico `.com` e os redirecionamentos dos sete aliases. Não houve
  alteração DNS. O contrato de contato WorkOrg/`FindLead` foi preservado.
- Catálogo, imagens, modelos Unity e armazenamento de novos PDFs usam Cloudflare.
  Mídia e novos PDFs utilizam buckets R2 privados de produção e URLs próprias
  do site; os nomes de infraestrutura ficam nos registros privados da operação.
- A publicação passou por 56 testes, conferência de 78 WebP do carousel, 198
  arquivos de mídia R2, dez builds Unity e oito vídeos. No navegador oficial
  desktop, Bridge inicializou; no celular, os 39 produtos circularam nos dois
  sentidos, sem recursos AWS observados. A interação 3D no celular não foi
  validada nessa conferência.
- O [preview V2](https://puttbrothers-v2-preview.team-web-592.workers.dev/) continua
  separado, com armazenamento de revisão, `noindex`
  e bloqueio de contato/upload PDF. Versão publicada
  `22b5b665-be05-4faf-b0fb-8fe036fbef25`; a fonte dessa publicação é `d28307b`.
  A branch `website-v2` recebeu posteriormente o ajuste de tipagem `ef3215f`, sem
  outra publicação. Um commit novo não altera automaticamente o preview.

## Aplicativo antigo preservado localmente

Rafael pediu salvar o material recuperável do aplicativo antigo em
`C:\OneDrive-ipdc\AI-Codex\ipdc-Apps\PuttBrothers` antes de retirar seus recursos
AWS. A preservação de código, configuração e objetos foi concluída, copiada para
esse destino, verificada integralmente e extraída. Os arquivos de origem e seus
conteúdos **não fazem parte do repositório público do website**.

| Evidência local | Resultado confirmado |
| --- | --- |
| Arquivo completo | 3.075.105.043 bytes |
| SHA-256 do arquivo | `98e4721e818eb913ef60d91aae520e7e6e861c35cf7b6ec30bdca66d27e48b82` |
| Extração | 2.090 arquivos/membros verificados |
| Objetos S3 | 418 objetos, 719.160.718 bytes |
| Lambda | 24 funções, 901 versões, 95 ZIPs únicos |
| Pacotes Lambda | 2.790.463.966 bytes |
| Fontes do backend recuperadas | 29 arquivos |

O recibo privado fica em
`AWS-preservation-20261023/extracted-001/EXTRACTION-VERIFIED.json`, dentro do
projeto local do aplicativo. Ele registra `validation: PASS`, `extraction: PASS`
e o hash do manifesto
`1a2b00886de49d908d63926638d7fd836817079751e2c86be4bb26b43b6182cf`.
Código Lambda, metadados de configuração, templates CloudFormation, exportações
da API e objetos S3, incluindo PDFs históricos, foram preservados. Nenhuma
variável de ambiente ou informação de cliente deve ser publicada neste Git.

Limites da recuperação:

- O código-fonte original da interface mobile **não foi encontrado**. A inspeção
  dos 95 pacotes encontrou zero marcadores de UI mobile e 35 ocorrências de
  metadados `.expo`; esses metadados não comprovam recuperação da interface.
- Rafael dispensou explicitamente os registros do banco do aplicativo. Não foi
  feito BACPAC, `.bak` ou outro export dos dados SQL. Esse export não é pendência
  nem requisito para a retirada autorizada. O RDS não foi reiniciado.
- O disco raiz EC2 de **8 GiB não foi convertido em imagem nem copiado
  integralmente**. O backup de código/configurações/S3 não representa um backup
  desse disco. O volume continua existente na AWS; sua perda deve integrar a
  confirmação de exclusão da instância.
- O arquivo bruto e seu manifesto foram produzidos antes da dispensa dos dados
  SQL. O indicador histórico de backup de banco pendente foi mantido intacto
  nesses arquivos para preservar os hashes; a decisão posterior está acima.

## Pausa AWS efetivamente executada

Após a verificação integral local e a dispensa dos registros SQL, foram aplicadas
somente ações reversíveis nos recursos identificados da Putt Brothers.
O estado final abaixo foi conferido por leitura, depois das solicitações de
parada. Não confundir o estado intermediário `stopping` com o resultado final.

| Recurso | Estado final observado |
| --- | --- |
| Instância EC2 NAT `t2.micro` | **Stopped** |
| RDS SQL Server Express `db.t3.small`, Single-AZ | **Stopped** |
| HTTP API antiga | Endpoint padrão `execute-api` desabilitado |
| 24 funções Lambda do aplicativo | Concorrência reservada **0 em todas as 24** |

A pausa preservou o estado anterior em arquivos privados para permitir retomada.
Os nomes, ARNs, hashes de código e configurações de rede das 24 funções foram
conferidos contra os metadados do backup verificado antes das alterações. São
23 funções com VPC e uma sem VPC, conforme a configuração original.

O comprovante privado consolidado é
`AWS-preservation-20261023/puttbrothers-stop-and-global-proof-20261023.json`,
no projeto local do aplicativo. SHA-256:
`e9d2df95eb2cd3e763afa8aa10a79ad6b0d049a1848080521ebd0a4086ba6d8a`.
O recibo foi capturado às 09:18:38 de Brisbane; a conferência foi consolidada
aproximadamente às 09:19. Ele contém o estado anterior, checkpoints, estado
posterior, inventário global e a confirmação final de EC2/RDS parados.

**Até a conferência da pausa, nada havia sido excluído.** Foram mantidos os quatro
buckets S3, objetos, versões, backups, EBS, funções, API, logs, permissões e a conta.
As funções antigas incluem
operações de jogadores, autenticação e pontuação, além do catálogo do website.
A concorrência zero bloqueia sua execução; não remove funções nem seus gatilhos.

O RDS informa reinício automático em **30/10/2026 às 07:49 de Brisbane**.
A pausa temporária não cancela esse reinício. Armazenamento e backups RDS, EBS,
S3 e outros recursos mantidos continuam sujeitos a cobrança.

## Inventário e cobrança

O inventário somente leitura cobriu as 17 regiões habilitadas para EC2, EBS,
Elastic IPs, NAT, balanceadores, RDS/backups, Lambda e APIs, além das consultas
globais S3, CloudFront, zonas Route53 e domínios registrados. Não substitui uma
auditoria de todos os serviços ou a fatura final. O resultado foi salvo em
`AWS-preservation-20261023/puttbrothers-final-global-inventory.json`, fora do Git.

- Foram identificados quatro buckets, referentes ao aplicativo, imagens,
  PDFs históricos e artefatos de implantação. Seus nomes e os IDs exatos dos
  recursos ficam no inventário privado, sem publicação neste documento.
- Não foram encontrados domínios registrados, zonas Route53 ou distribuições
  CloudFront nessa consulta. Lightsail não apresentou instâncias ou bancos.
- O Elastic IP sinalizado para revisão foi confirmado como **gerenciado pelo
  serviço RDS**. Não deve ser liberado manualmente como se fosse da instância NAT.
- Savings Plans e reservas apresentaram total zero na consulta; não foi feita
  nenhuma contratação.
- A conta compartilhada da IPDC continua aberta. Recursos alheios à Putt Brothers
  e o fechamento da conta não fazem parte da exclusão preparada.

Valores acumulados observados para outubro de 2026, em USD:

| Serviço | Sem impostos | Composição observada |
| --- | ---: | --- |
| RDS | 33,97 | Compute 32,05 e armazenamento 1,92 |
| EC2 | 7,99 | Compute 7,54 e EBS 0,45 |
| VPC / IPv4 público | 5,18 | Uso acumulado de IPv4 |
| S3 | 0,01 | Uso acumulado |
| Outros | 0,00 arredondado | Não prova ausência de recursos |
| Total sem impostos | 47,15 | |
| Impostos | 7,07 | |
| Total acumulado | **54,22** | Não é fatura final nem plano mensal fixo |

A pausa não apaga valores já acumulados e não comprova cobrança futura zerada.
O fechamento financeiro exige conferir os recursos restantes e a cobrança depois
das ações permanentes efetivamente autorizadas e concluídas.

## Verificação pública após a pausa

O relatório local `tmp/aws-paused-public-verification.json` registra **17 de 17
verificações aprovadas**, depois da pausa:

- Cinco páginas oficiais com HTTP 200 e indexação permitida.
- Catálogo com 39 produtos e planner com 30 máquinas, ambos de origem Cloudflare;
  imagens do planner locais e dimensões positivas em todas as máquinas.
- WebP Bridge de 300 × 214 px, 8.646 bytes e hash igual ao manifesto.
- HTML e loader Unity Bridge disponíveis; loader íntegro; WASM/data com HTTP 206,
  Range de 64 bytes e tipos corretos.
- Preview com `noindex`, catálogo disponível e contato/upload PDF retornando 403
  para dois POSTs de JSON vazio. Nenhum lead ou PDF válido foi enviado.
- Uma GET ao catálogo antigo da AWS retornou HTTP 404, inacessível.

No Chrome oficial desktop a 1280 px, o produto 33 abriu o 3D Bridge em
`/product-media/BRIDGE/build/index.html`: canvas presente, indicador de
carregamento concluído, sem aviso de erro e sem recursos AWS na página ou iframe.
No celular a 390 px, anterior voltou de 1 para 39 e próximo retornou para 1, com
WebP de 300 px e sem travamento.

**Limitação mobile preexistente:** uma regra em `coverflow.css`, abaixo de 720 px,
esconde `.modal-3d-button`, inclusive no modal. Não foi alterada nesta migração;
a interação 3D pelo botão no celular não está validada. A disponibilidade HTTP
dos arquivos Unity e o teste real de interação desktop foram confirmados.

Não houve nova publicação, alteração de funcionalidade ou mutação AWS nessa
verificação. Os testes completos de 198 mídias e 78 WebP não foram repetidos.

## Próximas ações e recuperação

1. Rafael confirmou posteriormente a **exclusão permanente** dos alvos
   apresentados, incluindo o banco sem snapshot final nem backups automáticos
   retidos, a instância e seu disco EC2 sem cópia, o backend e os quatro buckets:
   “Pode excluir tudo, vou finalizar todos os serviços com a AWS.” A confirmação
   autoriza a execução desse escopo; não comprova que as exclusões terminaram.
2. Registrar o tratamento dos PDFs históricos e suas referências: a cópia local
   preserva os arquivos, mas links antigos `amazonaws.com` deixariam de funcionar
   após a exclusão dos objetos. O Cloudflare não redireciona essas URLs da AWS.
3. Executar o plano autorizado, conferir recursos retidos ou órfãos e registrar
   os resultados reais, inclusive custos residuais. O estado final de exclusão
   será registrado após a obtenção dos comprovantes, sem presumir cancelamento
   concluído ou cobrança futura zerada.

Rollback disponível do website: versão Cloudflare
`62af4949-e440-4891-ad43-819665e83830`, com interface V1 e backend já independente
da AWS. **Esse rollback não exige iniciar o RDS**. Ele restaura a versão do
website, não os dados de recursos AWS que venham a ser excluídos. Conferir versão
ativa e bindings antes de qualquer rollback; nenhum rollback foi feito aqui.
