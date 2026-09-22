# MinimalGPT

> [!WARNING]
> **Projeto descontinuado — precisa de atualização.** Segundo o autor, a versão 0.0.3 funcionava anteriormente, mas falhou em uma tentativa posterior. A versão 0.0.4 é uma revisão de segurança para preservação do projeto, **não uma atualização de compatibilidade validada**. A compatibilidade com a interface atual do ChatGPT **não foi verificada**. Este repositório disponibiliza código para referência, não uma extensão pronta para uso ou com suporte ativo.

[English](../README.md) · **Português (Brasil)** · [Español](README.es.md) · [Русский](README.ru.md)

O MinimalGPT é uma extensão experimental para Chromium (Manifest V3) que reduz a poluição visual do ChatGPT sem substituir o aplicativo original. Foi concebida para **uma conversa por aba do navegador**.

## Estado do projeto

**Descontinuado / sem manutenção.** A última versão que o autor relata ter funcionado é a 0.0.3, em uma utilização anterior; a causa e a abrangência da falha relatada depois ainda são desconhecidas. O autor relatou posteriormente que a versão 0.0.4 não ocultava a maior parte dos controles pretendidos. A interface do ChatGPT muda independentemente desta extensão, e seus seletores podem deixar de corresponder aos elementos da página. A 0.0.4 é uma **revisão de segurança para preservação**, não uma versão com compatibilidade verificada. Ela limita alterações indevidas na interface e inicia novas instalações com o modo desativado. Não há garantia de atualizações, compatibilidade ou suporte. O projeto não declara vínculo oficial com a OpenAI ou o ChatGPT.

Se a página perder controles ou parecer quebrada, desative o MinimalGPT com `Alt+M` e recarregue a aba do ChatGPT. Se o atalho falhar, desative ou remova a extensão em `chrome://extensions/` e recarregue a página. Não dependa deste projeto para fluxos de trabalho críticos.

## Comportamento pretendido

Quando ativado manualmente, o perfil baseado principalmente em CSS tenta ocultar os elementos identificáveis da barra lateral e do cabeçalho, o compartilhamento e controles selecionados de voz/ditado e de ações das respostas. Ele pretende preservar a área de escrita, os anexos, o envio e a cópia de mensagens. Também reduz sombras decorativas da área de escrita e ajusta a largura de leitura quando reconhece os elementos. O resultado depende do DOM e do idioma atuais do ChatGPT. Alguns controles podem permanecer visíveis quando seus identificadores mudam; isso é preferível a remover funções não relacionadas.

O MinimalGPT não intercepta requisições, não acessa credenciais da conta, não carrega código remoto e não instala observadores do DOM. Solicita somente a permissão `storage` do Chromium. A extensão atua apenas em `https://chatgpt.com/*` e armazena localmente uma preferência de ativação/desativação. Examine os arquivos de código antes de instalar uma extensão sem manutenção.

## Arquivos

- `manifest.json` — configuração da extensão, idioma padrão e permissões.
- `_locales/en/messages.json` — nome, descrição e mensagens de estado em inglês.
- `_locales/pt_BR/messages.json` — nome, descrição e mensagens de estado em português brasileiro.
- `_locales/es/messages.json` — nome, descrição e mensagens de estado em espanhol.
- `_locales/ru/messages.json` — nome, descrição e mensagens de estado em russo.
- `docs/README.es.md` — documentação completa em espanhol.
- `docs/README.ru.md` — documentação completa em russo.
- `minimal.css` — regras visuais opcionais; não foi modificado pela internacionalização.
- `content.js` — preferência local, atalho `Alt+M` e aviso de estado traduzido.
- `tests/` — testes básicos estáticos e do script, sem dependências externas; não verificam a compatibilidade em um navegador real.
- `.github/workflows/smoke.yml` — execução automatizada dos testes após alterações e em pull requests.

## Idiomas

O inglês (`en`) é o idioma padrão; o português brasileiro (`pt_BR`), o espanhol (`es`) e o russo (`ru`) também estão disponíveis. O Chromium escolhe uma tradução disponível segundo o idioma do navegador e usa o inglês como alternativa quando não houver tradução correspondente. O chinês simplificado (`zh_CN`) está planejado, mas ainda não está disponível.

**O idioma do navegador pode ser diferente do idioma do ChatGPT.** Traduzir as mensagens do MinimalGPT não altera os seletores CSS usados para reconhecer os controles do site nem corrige a incompatibilidade relatada. Esta etapa não altera o comportamento da extensão.

## Instalação local para inspeção (por sua conta e risco)

1. Baixe ou clone este repositório e examine seu conteúdo.
2. No Chromium, abra `chrome://extensions/`, habilite o **Modo do desenvolvedor** e escolha **Carregar sem compactação**.
3. Selecione a pasta que contém `manifest.json`.
4. Recarregue `https://chatgpt.com/`. Uma nova instalação começa **DESATIVADA** por segurança; pressione `Alt+M` para ativar.
5. Após modificar ou atualizar os arquivos, recarregue a extensão em `chrome://extensions/` e depois recarregue a aba do ChatGPT.

A preferência local permanece salva após recarregamentos. Instalações que já salvaram o estado ativado continuam ativadas até serem desativadas explicitamente. O navegador ou o site podem usar o mesmo atalho `Alt+M`; se ele não funcionar, desative a extensão na página de extensões do Chromium.

## Testes e limitações

Com Node.js 22, execute `node --test tests/*.test.cjs`. Os testes verificam o manifesto, as chaves de tradução, precauções estáticas no CSS e o comportamento simulado do atalho e do armazenamento. **Eles não verificam a interface atual do ChatGPT, a acessibilidade ou o funcionamento de ponta a ponta.** É necessário testar manualmente no navegador antes de afirmar que uma versão é compatível.

Limitações conhecidas: a extensão depende de atributos privados e não documentados do DOM do ChatGPT; recursos, idiomas e layouts podem variar; não há detecção automática de incompatibilidade nem autorreparo. Evite adicionar regras abrangentes, como ocultar todos os elementos `header`, todos os botões diferentes de Copiar ou qualquer elemento cujo identificador contenha `audio`.

## Histórico de versões

- **0.0.4 (2026-09-22):** revisão de segurança para preservação: avisos de descontinuação, modo desativado por padrão em novas instalações, seletores CSS conservadores e testes básicos. **A compatibilidade com o ChatGPT atual não foi verificada.** O autor relatou depois que a maioria das alterações visuais pretendidas não funcionava. Uma modificação não solicitada dos seletores, identificada como 0.0.5, foi revertida; o código da 0.0.4 é a base da internacionalização.
- **0.0.3 (2026-08-27):** atualizações de seletores para voz, ditado e ações das respostas; última versão que o autor relata ter funcionado anteriormente, com falha relatada depois.
- **0.0.2:** perfil de baixo estímulo visual para uma conversa por aba e redução de movimentos.
- **0.0.1:** extensão inicial em Manifest V3, atalho `Alt+M` e persistência local.

Nenhuma licença de código aberto foi concedida neste repositório. A visibilidade pública, por si só, não autoriza redistribuição ou modificação do código. O autor poderá escolher uma licença separadamente.
