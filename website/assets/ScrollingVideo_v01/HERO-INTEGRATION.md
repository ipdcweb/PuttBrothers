# Hero scrolling V2

Implementação local de 12 de outubro de 2026. Não publicada.

## Fonte aprovada

- `ScrollingVideo_v01.mp4`, 28,125 segundos, 1280 × 720, 24 fps.
- Original preservado. O roteiro segue os frames deste vídeo, não os nomes de tempo dos antigos PNGs.
- A imagem e a chamada inicial existentes foram mantidas: “We build what's next in play.”

## Sequência comercial

| Tempo do vídeo | Cena | Chamada | Posição desktop |
| --- | --- | --- | --- |
| 2,6–7,7 s | Minigolf e ambiente social | Make every putt / a reason to stay. | Direita |
| 8,1–12,8 s | Revelação da TV e ambiente | Your space. / Their next destination. | Inferior esquerda |
| 13,2–17,6 s | Simulador de corrida | Put your guests / in the driver's seat. | Esquerda |
| 18–22,1 s | SPACE Z e conjunto de atrações | Small putts. / Big possibilities. | Direita |
| 22,5 s–final | Stand completo e letreiro | Your next big attraction / starts here. | Inferior esquerda |

CTA final: **Plan my entertainment project**, direcionado a `/contact#contact`.
Não há promessa de ROI nem afirmação de VR, pois o frame do simulador mostra uma tela, sem evidência de headset.

## Comportamento

- Scroll nativo controla o tempo de um vídeo pausado, sem autoplay ou áudio.
- Voltar o scroll retrocede o vídeo e os textos.
- Texto sincronizado ao frame decodificado, não apenas ao seek solicitado.
- As entradas alternam deslocamento lateral e vertical com opacidade, branco e amarelo.
- A abertura segura os primeiros 3,5% do percurso. O vídeo termina aos 94%, deixando uma pequena permanência no CTA final antes de a página continuar.
- Sticky limitado ao hero: 850 svh desktop, 750 svh mobile.
- A versão móvel preserva a largura inteira do filme, com a copy abaixo, evitando cortar as atrações.
- “Skip intro” libera acesso imediato ao conteúdo seguinte.
- Redução de movimento do sistema é respeitada. “Enable scroll experience” ativa explicitamente a experiência. A escolha local usa `putt-brothers-v2-hero-motion-v1`.
- Modo estático tem as cinco mensagens e CTA, sem percurso de scroll artificial. Erros de mídia também exibem alternativa estática e “Try again”.

## Arquivos

- `components/v2/scroll-hero.tsx`: player, estado de mídia, controles e acessibilidade.
- `lib/scroll-hero.ts`: copy, tempos e cálculos testáveis.
- `styles/scroll-hero.css`: layout e posições responsivas.
- `scripts/prepare-scroll-hero.mjs`: prepara derivados usando FFmpeg.
- `tests/scroll-hero.test.mjs`: testes de tempo, reversibilidade, capítulos e CTA.
- `vite.config.ts`: exclui esta pasta de originais do watcher de desenvolvimento, evitando quedas por bloqueios `EBUSY` no Windows. Os derivados em `public/videos` continuam sendo servidos normalmente.
- `public/videos/putt-brothers-scroll-v1-desktop.mp4`: 1280 × 720, 18.866.968 bytes.
- `public/videos/putt-brothers-scroll-v1-mobile.mp4`: 768 × 432, 7.097.514 bytes.

Derivados H.264, yuv420p, GOP de 12 frames (0,5 s), sem B-frames, sem áudio e com faststart. Apenas uma variante é carregada por montagem. O vídeo original não foi alterado.

## Validação

- Compilação Vinext concluída.
- 24 testes Node passaram, incluindo o contrato do formulário e isolamento V2.
- Ambos os MP4 responderam com HTTP 206, `video/mp4` e suporte a byte ranges.
- Chrome: abertura com poster, opção explícita sob redução de movimento, avanço, retorno, timestamps estáveis sem scroll, capítulos intermediários, CTA final e liberação da página verificados por estado DOM/mídia.
- 390 × 844: variante móvel carregada, frame completo, texto e controles dentro da largura; sem overflow horizontal.
- Alternativa estática, ausência de download nesse modo e persistência após reload verificadas.
- TypeScript global ainda reporta erros em módulos não alterados (Radix, planner, AWS e Worker). Nenhum diagnóstico nos arquivos do novo hero/Home.
- Ainda dependem da avaliação de Rafael: ritmo subjetivo, composição visual e conforto da animação. Não foi feita aprovação estética automática. Safari/iPhone físico e falha de rede simulada não foram testados.

Servidor de desenvolvimento: `http://localhost:3002/`.
Nenhuma alteração em V1, integrações de contato, credenciais, DNS ou produção.
