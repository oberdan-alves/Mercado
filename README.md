# Mercado

Lista de mercado offline, preservando o HTML/CSS/JavaScript original, com versão para computador e aplicativo Android via Capacitor. Sem login, backend ou banco na nuvem.

Para instalar o APK já gerado no celular, siga o [manual de instalação](docs/INSTALAR_NO_CELULAR.md). Não é necessário Android Studio para instalar.

## Computador / VS Code

Requer Node.js 22 ou superior (recomendado Node.js 24 LTS).

```sh
npm ci
npm run dev
```

Abra `http://127.0.0.1:8080` no navegador. Também é possível abrir diretamente `mercado (4).html`, sem Node ou servidor. Os dados pertencem ao navegador e à origem usada: mudar de endereço/porta ou abrir outro arquivo não transfere automaticamente a lista. Use Compartilhar → Exportar TXT / Importar para transferir.

Edite **`mercado (4).html`**: ele continua sendo a fonte única da interface, estilos e regras. `npm run build` prepara `dist/index.html` e a integração nativa; não edite `dist/` ou os arquivos web copiados em `android/`.

## Android

```sh
npm run android:sync
npm run android:open
npm run android:debug
```

Requer Android Studio, SDK Android 36, Build Tools 35.0.0 e Java 21. Suporta Android 7 (API 24) ou superior. O app se chama **Mercado** e usa o identificador permanente `br.com.oberdanalves.mercado`.

Leia o passo a passo de instalação no Windows, assinatura, atualização e testes em [docs/ANDROID.md](docs/ANDROID.md).

## Dados e TXT

- `localStorage`: chaves existentes `mkt3_items` (lista) e `mkt3_cat` (catálogo) mantidas.
- Compartilhar → Exportar TXT: baixa arquivo UTF-8 no computador; no Android abre o compartilhamento de um arquivo real, para salvar em um destino compatível ou enviar.
- Importar: seletor de arquivos nativo do navegador/WebView, com validação e confirmação.
- TXT antigo: mantém a mesclagem por nome, inclusive sem acentos; atualiza correspondências e preserva produtos ausentes do arquivo.
- TXT novo: restaura o estado completo, incluindo catálogo, ordem e precisão dos números, após confirmação.
- Backup automático anterior à última importação: botão de restauração aparece abaixo dos campos. Restaurar troca o backup com o estado atual, permitindo desfazer a restauração. Esse backup fica no mesmo dispositivo; exporte TXT para cópia externa.
- Arquivo inválido: nenhuma importação parcial é aplicada.

O TXT continua contendo `Nome: quantidade x preço = total`, cabeçalho e total. Uma linha `DATA: MERCADO_BACKUP_V1 {...}` guarda metadados JSON; o importador antigo já ignora linhas `DATA`. Não remova essa linha se quiser recuperação integral. A versão antiga lê os produtos, mas não recupera o catálogo adicional. O TXT contém todos os dados em texto simples.

## Original preservado

Cópia intacta da versão anterior à adaptação: [original/mercado (4).html](original/mercado%20%284%29.html). O hash está em `original/SHA256SUMS`. Os utilitários Python antigos de sincronização foram mantidos; seus caminhos Windows são específicos da máquina original e não são usados no build.

## Testes

```sh
npx playwright install chromium
npm test
```

Para um Chromium já instalado, defina `CHROMIUM_PATH` para seu executável. Consulte resultados e limites reais em [docs/VALIDACAO.md](docs/VALIDACAO.md).
