# Análise do programa existente antes da adaptação

O arquivo completo `mercado (4).html` foi lido antes da primeira alteração desta adaptação. A cópia exata desse estado está em `original/mercado (4).html`, com hash SHA-256 registrado. O arquivo principal permanece a fonte da aplicação, sem reescrita em framework.

## Funcionalidades encontradas e mantidas

- Cadastro de produto, quantidade e preço; entrada de texto em maiúsculas.
- Produto repetido por nome: atualiza quantidade e preço, em vez de somar outra linha.
- Total por produto (quantidade × preço) e total geral da lista.
- Busca por trecho do nome, sem distinguir maiúsculas/minúsculas.
- Autocomplete com catálogo de nomes e últimos preços.
- Edição de quantidade/preço em modal e exclusão pelo modal ou pela lixeira.
- Zerar lista com confirmação, mantendo o catálogo para autocomplete.
- Calculadora de unidades: compara preço ÷ quantidade ÷ tamanho para dois produtos; mostra menor, maior ou igual; permite limpar e voltar.
- Lista e calculadora com as fontes ampliadas anteriormente neste projeto.

## Estrutura e armazenamento originais

O JavaScript usa `items = [{name, qty, price}]` e `catalog = {nomeMinusculo: {name, price}}`. São serializados como JSON em `localStorage`, nas chaves `mkt3_items` e `mkt3_cat`. `loadData()` os recupera na inicialização; `saveData()` é chamado após alterações. Não há IndexedDB, servidor, login, dependência web externa ou banco remoto.

As mesmas chaves e estruturas foram mantidas: não é necessária migração dos dados de uma mesma origem. A origem do app Android é distinta do navegador, portanto a transferência inicial é feita por TXT. Atualizações Android devem manter identificador, assinatura e origem WebView.

## Importação e compartilhamento originais

O importador usa `<input type="file">` e `FileReader` UTF-8. Reconhece o formato `Nome: qtd x preço = total` e o formato antigo em duas linhas, com `Qtd`, `Preço`/`Preco` e `Total`. Faz mesclagem por nome normalizado sem acentos, com confirmação. A versão original aceitava linhas parciais e ignorava as não reconhecidas; agora o arquivo é validado integralmente antes de aplicar.

O antigo Compartilhar construía o TXT, mas compartilhava apenas texto com `navigator.share`; como alternativa, copiava para a área de transferência. Não gerava um arquivo TXT para download. O botão Compartilhar agora oferece tanto o compartilhamento de texto original quanto Exportar TXT. A adaptação reaproveita a estrutura desse texto e acrescenta download no computador e arquivo UTF-8 via Filesystem + Share no Android.

A linha adicional `DATA: MERCADO_BACKUP_V1 {...}` é ignorada pelo importador antigo e permite ao novo restaurar todos os registros, ordem, números sem arredondamento e catálogo. Um backup local anterior à importação permite restauração. O comportamento de mesclagem foi preservado para os TXT anteriores.

## Arquitetura adicionada

- Capacitor 8 com plugins oficiais Filesystem e Share; sem React, Angular ou Flutter.
- `scripts/build.mjs`: copia o mesmo HTML para `dist/index.html` e empacota apenas a integração nativa.
- `scripts/native.js`: grava TXT UTF-8 no cache privado e entrega o URI ao compartilhamento Android. Não requer permissão ampla de armazenamento.
- Projeto Android com nome Mercado, ícone de carrinho próprio e assets locais. Sem URL de servidor remoto.
- Configuração de assinatura release por arquivo local ignorado pelo Git; nenhuma chave definitiva ou senha foi criada ou enviada ao repositório.
