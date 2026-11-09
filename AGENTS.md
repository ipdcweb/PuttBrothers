# Putt Brothers: fonte local única, 06/11/2026

## Publicação e isolamento atualizados, 10/11/2026

- Rafael autorizou criar `dev.puttbrothers.com`, registrar a revisão no GitHub e publicar a mesma revisão no Dev e no oficial nesta entrega. Publicações futuras seguem local -> Dev -> aprovação -> oficial.
- Branch Dev: `dev.puttbrothers.com`. Branch oficial existente: `website-v2-production`. Uma única pasta local; não criar cópias dev/prod ou repositórios adicionais.
- O repositório público contém o website em `website/`. A plataforma operacional independente `app/` permanece local e ignorada; nunca incluir sua base, uploads ou configuração Microsoft no website/Git público.
- Padrão confirmado: `staging-app.puttbrothers.com` comunica-se somente com `dev.puttbrothers.com`; `app.puttbrothers.com` comunica-se com `puttbrothers.com`. Registrar esse isolamento, sem criar/publicar plataformas como consequência da entrega dos websites.
- Consultar `website/DEV-WORKFLOW.md` e os recibos locais de release. As permissões e fontes únicas abaixo permanecem válidas; a autorização atual supera apenas as limitações históricas para esta publicação.

## Atualização posterior: plataforma local autorizada

Rafael autorizou implementar WebsiteLocal/app localmente, sem login, com Workspace/Manager/Admin/Developer e preparação de campanhas. A primeira base executável está disponível em 127.0.0.1:8790; ler app/README.md e app/AGENTS.md a partir de WebsiteLocal. A conexão Microsoft de hello@puttbrothers.com e accesscode@puttbrothers.com foi concluída e validada, incluindo dois testes autorizados para Rafael. Login real, publicação e envio operacional de campanhas continuam pendentes; ver WebsiteLocal/app/docs/MICROSOFT-CONEXAO.md a partir da raiz do projeto. Esta decisão supera as referências de somente planejamento abaixo, sem alterar os limites do website.

- Esta é a única pasta ativa de desenvolvimento. `website/` contém a fonte única do website; `app/` contém documentação e futura plataforma. Não criar outra cópia local para dev ou produção.
- O fluxo solicitado por Rafael é local -> dev -> revisão/aprovação -> oficial. Usar os comandos guardados `build:dev`, `build:production`, `deploy:dev` e `deploy:production` a partir desta pasta.
- Produção promove a mesma revisão identificada pelo recibo de dev. Se o HEAD ou conteúdo mudar, repetir a passagem pelo dev. O recibo técnico não constitui aprovação visual ou comercial.
- O worktree preserva a branch histórica website-v2-production e o repositório ipdcweb/PuttBrothers. Não presumir que existem dois repositórios GitHub nem criá-los automaticamente.
- O `.git` aponta para ../Backup/WebsiteLocal_V1/.git. Preservar esse histórico e os worktrees arquivados. Não usar reset, clean, prune ou exclusões para organizar arquivos.
- Leia website/AGENTS.md antes de alterar o website e app/AGENTS.md antes de trabalhar na plataforma. `website/app/` é o App Router; `app/` nesta raiz é outro projeto.
- Esta organização autoriza consolidar arquivos locais e adequar ferramentas ao fluxo único. Não inclui publicação, alteração de DNS/secrets, migração de banco, configuração Microsoft ou envio real.
- Preservar o formulário oficial, o contrato WorkOrg/FindLead, os arquivos de mídia e os controles de isolamento do dev. A migração do formulário para Microsoft pertence a uma etapa futura própria.
- A plataforma continua planejada. Microsoft 365 hello@puttbrothers.com, CampaignID na primeira coluna do Excel e separação entre contatos de campanha e usuários são decisões aprovadas.
- Reutilizar módulos revisados da GC somente na implementação autorizada; não copiar dados, credenciais, sessões, uploads, logs ou bindings de serviços.
- Instruções de localização anteriores e a exigência de duas pastas locais são superadas por esta decisão. Registros históricos de releases permanecem evidência de sua época, não instruções para recriar as pastas antigas.
