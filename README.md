# Putt Brothers: único ambiente local

Esta é a pasta usada para todo o trabalho ativo da Putt Brothers, conforme a decisão de Rafael em 06/11/2026.

```text
WebsiteLocal/
  website/  código único do website
  app/      plataforma local e documentação
```

Não existe uma segunda cópia local de desenvolvimento. A mesma fonte do website é preparada para dois ambientes Cloudflare separados: dev e oficial.

## Fluxo de trabalho

1. Fazer alterações locais em `website/`.
2. Validar a mudança e preparar o alvo dev com `pnpm run build:dev`.
3. Publicar no dev com `pnpm run deploy:dev`, quando essa publicação estiver autorizada.
4. Rafael e a equipe revisam o endereço dev.
5. Após aprovação, promover a mesma revisão com `pnpm run deploy:production`.

`pnpm run build:production` prepara e valida o alvo oficial sem publicar. Os comandos de publicação preservam guardas de configuração e revisão. A produção exige o recibo de publicação no dev correspondente ao mesmo HEAD; alterar a fonte depois da revisão exige voltar ao dev. A existência de um recibo não substitui a aprovação de Rafael.

- Dev: https://dev.puttbrothers.com/ (Worker de prévia existente, com endereço workers.dev preservado).
- Oficial: https://puttbrothers.com/

Os ambientes têm Worker, armazenamento, limites e comportamento de indexação separados. O dev mantém bloqueados os envios do formulário e os uploads PDF. O formulário oficial continua com o contrato WorkOrg atual.

## Website e plataforma

[website/README.md](website/README.md) contém os detalhes do website. Seu diretório `website/app/` pertence ao roteamento Next/Vinext.

`app/` é a plataforma operacional independente, mantida localmente fora deste repositório público. Seus arquivos, banco, uploads e configuração Microsoft são preservados. A publicação do website não publica a plataforma. A documentação local fica em `app/README.md`.

Padrão de ambientes confirmado por Rafael em 10/11/2026:

- Plataforma staging: `staging-app.puttbrothers.com`, comunicando-se somente com `dev.puttbrothers.com`.
- Plataforma oficial: `app.puttbrothers.com`, comunicando-se com `puttbrothers.com`.

Esses destinos definem o isolamento futuro; este fluxo publica apenas os websites. A criação das plataformas e de sua autenticação/integração pertence a uma implantação própria.

## Git e arquivos históricos

O repositório GitHub existente continua sendo `ipdcweb/PuttBrothers`. A branch `dev.puttbrothers.com` recebe alterações para revisão no Dev; `website-v2-production` registra a revisão promovida ao oficial. As branches históricas permanecem preservadas. A branch `main` contém o histórico anterior e não é alvo deste fluxo. Consulte [o fluxo de branches e publicação](website/DEV-WORKFLOW.md).

O arquivo `.git` desta pasta aponta para os metadados compartilhados em `../Backup/WebsiteLocal_V1/.git`. Não excluir esse arquivo histórico. As antigas pastas de preview e snapshots estão em Backup, sem papel de desenvolvimento ativo.

A organização não publica por si só e não altera serviços remotos. Resultados da movimentação e validação ficam no [registro da consolidação](../Backup/organization-2026-11-06-single-workspace/README.md). Consulte também o [mapa geral](../README.md).
