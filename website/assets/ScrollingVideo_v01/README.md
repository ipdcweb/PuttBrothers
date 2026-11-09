# Putt Brothers — ScrollingVideo_v01

Revisão do percurso pelo stand vazio. **8 imagens-base, 7 trechos de 5 segundos, 35 segundos planejados.** Nenhum vídeo foi gerado e o website não foi alterado.

## Comece aqui

- [Roteiro e prompts completos para o Kling](KLING_PROMPTS_E_ROTEIRO.txt)
- [Cenas, referências e histórico de geração — JSON](IMAGE_PROMPTS_AND_PROVENANCE.json)
- [Dimensões e hashes conferidos](FILES_VERIFIED.json)

Use somente os oito PNGs da raiz, nesta ordem:

| Tempo | Quadro | Cena |
|---|---|---|
| 0 s | [A — abrir imagem](01_A_00s_tv_content.png) | Ambiente aspiracional de minigolfe e hospitality, sem pessoas. A imagem preenche toda a tela. |
| 5 s | [B — abrir imagem](02_B_05s_tv_reveal.png) | A moldura e a parede de madeira revelam que o ambiente anterior é conteúdo de uma TV. |
| 10 s | [C — abrir imagem](03_C_10s_f1_simulator.png) | Um único simulador vermelho, assento único, chassi tubular, monitor curvo e PC com três ventoinhas azuis. |
| 15 s | [D — abrir imagem](04_D_15s_space_z.png) | Plataforma azul estrelada, borda vermelha, foguete, torre com astronauta decorativo, rampa e pedras lunares. |
| 20 s | [E — abrir imagem](05_E_20s_minigolf_interior.png) | Vista próxima do setor esquerdo, com gramado, áreas claras orgânicas, bandeiras, madeira e iluminação interna. |
| 25 s | [F — abrir imagem](06_F_25s_exit_left.png) | Vista do limiar externo da abertura esquerda, mantendo o olhar voltado ao minigolfe. |
| 30 s | [G — abrir imagem](07_G_30s_logo_facade.png) | Símbolo amarelo e letreiro físico Putt Brothers com LED por trás das letras. |
| 35 s | [H — abrir imagem](08_H_35s_full_booth.png) | Vista aberta, um SPACE Z e um simulador, sem hastes luminosas acima do teto. Alternativa com os quatro diretores guardada separadamente. |

A → B → C → D → E → F → G → H. A imagem final de um trecho é o controle inicial do próximo. Na produção real, conferir também o último frame efetivamente entregue pelo Kling.

## Alterações aplicadas

- Interior e conteúdo da TV sem pessoas; astronauta branco permanece como peça decorativa do SPACE Z.
- Um único SPACE Z, baseado na referência recuperada: torre, foguete, plataforma azul estrelada e borda vermelha. Nome correto **SPACE Z**, não SpaceX.
- Um único simulador vermelho de corrida, assento único, chassi tubular, monitor curvo, volante e PC com três ventoinhas azuis.
- Percurso proposto: TV → simulador → SPACE Z → minigolfe → saída esquerda olhando para dentro → letreiro → stand completo.
- Letreiro físico **Putt Brothers**, abaixo do símbolo, com iluminação de LED por trás das letras.
- Retiradas as hastes luminosas que passavam acima do teto. Iluminação interna preservada.
- O stand continua sendo o destaque; não aproximar nem ampliar artificialmente os diretores.

## Diretores — escolha de qualidade

A composição com quatro diretores pequenos no piso externo à direita foi aprovada quanto a posição e escala. A última tentativa facial usou as quatro **fotos originais do website**, não apenas os avatares anteriores.

Mesmo assim, os rostos ocupam poucos pixels no enquadramento aberto e não foram considerados suficientemente fiéis para recomendar como versão final. Como Rafael autorizou retirar as pessoas se o resultado não convencesse, a **sequência principal termina sem diretores**.

- [Alternativa mais recente com rostos refinados](alternatives/08_H_directors_face_refinement.png) — para avaliação de Rafael; não aprovada como identidade final.
- [Versão anterior dos diretores](alternatives/08_H_directors_before_face_refinement.png) — histórico de comparação.
- [Master atual sem pessoas](references/stand_empty_master_current.png).

Não existe garantia de que aumento de resolução recupere a identidade correta. Se os diretores forem essenciais, uma composição com fotografias reais é uma possibilidade futura; não foi produzida neste pacote.

## Resolução e pendência 4K

Todos os oito quadros ativos e as duas alternativas têm **1672 × 941 pixels nativos**, confirmados nos arquivos. Não são 4K.

O pedido de **3840 × 2160 com melhor definição facial permanece pendente**. A ferramenta integrada entregou a resolução acima mesmo quando o prompt pediu 4K. O recurso de upscale com IA consultado requer plano pago na conta conectada. Não houve compra, assinatura ou geração paga externa. Não foi feita simples interpolação para apresentar falsamente como detalhe 4K.

Minha recomendação é validar a direção visual e o percurso antes de contratar uma ferramenta só para aumentar resolução.

## Continuidade: testar antes de produzir o lote

O trecho **D → E** é o principal teste: a câmera precisa ligar os dois setores por circulação real, sem atravessar o painel central. Essa passagem é uma proposta inferida dos renders, não uma planta técnica confirmada. Se o Kling deformar a arquitetura, inserir um quadro intermediário e prolongar a duração; não esconder o problema com morphing.

Verificar também:

1. TV permanece uma superfície plana; a abertura não vira um portal.
2. Máquinas, bandeiras, plantas, letreiro e reflexos não mudam de lugar.
3. Saída acontece pela abertura esquerda, sem atravessar bancos ou paredes.
4. Câmera mantém altura, exposição, direção e velocidade coerentes.
5. Junções funcionam ao pausar e ao reproduzir ao contrário.
6. Não aparecem pessoas, novos assentos, foguetes duplicados ou hastes acima do teto.
7. Se a alternativa com diretores for aprovada, eles são revelados pelo enquadramento, nunca surgem por fade ou caminham para a cena.

Os quadros são visualizações por IA, **não fotografias de um stand construído nem prova de continuidade temporal**. Pequenos detalhes podem variar; a aprovação final depende dos vídeos e da revisão da equipe.

## Organização e preservação

- Raiz: oito quadros ativos e os documentos atuais.
- `alternatives/`: duas opções com diretores, separadas da sequência principal.
- `archive_previous_with_people/`: imagens e documentos anteriores preservados.
- `references/GST_Return_recovered/`: 12 imagens recuperadas do outro chat.
- `references/RECOVERED_GST_PROVENANCE.json`: origens e prompts dessa recuperação.
- `references/stand_empty_master.png`: master histórico, anterior às correções de letreiro/teto; **não usar como quadro ativo**.
- `references/stand_empty_master_current.png`: master atual, com as correções.

A ferramenta integrada de imagens foi usada para os edits. As orientações de continuidade conduziram o uso de referências comuns, a separação da campanha em camadas e o teste prioritário da passagem entre ambientes. Prompts completos estão registrados no JSON. Não houve implementação, publicação, commit ou push.
