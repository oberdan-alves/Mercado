# Validação executada e limites

## Navegador

Executado neste ambiente Linux com Chromium instalado e Node.js 24:

```sh
CHROMIUM_PATH=/usr/bin/chromium npm test
```

Resultado: **16 testes passaram; 1 teste foi pulado** porque a política administrativa do Chromium bloqueia navegação `file://`. O teste de arquivo local permanece no projeto para execução em um computador sem essa restrição; a política não foi desativada.

Verificado:

- Cadastro, maiúsculas e acentos, atualização de produto repetido, edição, busca, exclusão rápida e pelo modal.
- Zerar com cancelamento e confirmação; catálogo/autocomplete preservados.
- Importação da lista TXT anterior e restauração do backup local.
- Compartilhamento de texto original preservado.
- Exportação de arquivo UTF-8 com download real no navegador.
- Exportação e importação entre dois perfis separados, preservando catálogo, ordem e valores fracionários exatos. Isso simula armazenamentos distintos; não é um teste entre dois aparelhos físicos.
- Formato TXT antigo em duas linhas, números BR/EN e registro com quantidade zero.
- Recusa de arquivos inválidos e cancelamento sem alterações.
- Comparações menor/igual/maior na calculadora e limpeza.
- Operações sem rede depois da abertura da página, sem requisições externas.
- Integração JavaScript nativa testada com substituto do bridge (encaminhamento do TXT e tratamento de erro). Esse teste não exercita o compartilhamento do Android.
- Persistência após fechar e reabrir o Chromium com perfil em disco.
- Recuperação das chaves antigas sem migração.
- Importação do TXT novo pelo importador original preservado.
- Layout e acesso a controles em larguras 320, 360 e 390 px, sem transbordamento horizontal nos componentes verificados.
- Nenhum erro JavaScript nos testes de página.

## Original

A cópia preservada tem o mesmo SHA-256 do HTML no commit `0552ae9`, anterior à adaptação. Verificação: `sha256sum -c original/SHA256SUMS`.

## Android

Consulte os resultados de compilação adicionados abaixo. Não há dispositivo Android físico conectado nem emulador disponível nesta tarefa.

Não foram executados em aparelho: instalação, abertura em modo avião, seletor de TXT do Android, compartilhamento/salvamento nativo, transferência entre aparelhos, persistência após encerrar o app nem atualização de APK sobre instalação existente. O roteiro dessas verificações está em `docs/ANDROID.md`.

Release definitivo: configuração e instruções preparadas, mas nenhuma chave privada de distribuição foi criada e nenhum release assinado com uma chave do proprietário foi produzido. A chave definitiva deve permanecer com o proprietário para manter futuras atualizações compatíveis.

### APK de teste gerado

- Compilação `:app:assembleDebug` concluída com geração do APK (`versionCode=1`, `versionName=1.0.0`).
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`; cópia para entrega em `artifacts/Mercado-debug.apk`, incluída no Git junto ao manual e checksum. A saída de build em `android/` continua ignorada.
- Assinatura debug verificada com `apksigner`: válida, APK Signature Scheme v2.
- Inspeção com `aapt`: nome Mercado, pacote `br.com.oberdanalves.mercado`, Android mínimo API 24, alvo API 36.
- Assets do APK comparados byte a byte com o build web atual. Configuração empacotada sem `server.url` remoto.
- SHA-256 do APK desta compilação: `cc3e10f60ac541a5c4e52b44e97657997160b68af6d1d5607cb5b0a71a3f0eb8`.

Ferramentas usadas: Capacitor 8.5.3, Filesystem 8.1.5, Share 8.0.3, Gradle 8.14.3 (distribuição verificada por SHA-256), SDK 36, Build Tools 35.0.0 e Microsoft OpenJDK 21.0.13. As ferramentas de SDK foram verificadas contra checksums oficiais; o JDK foi obtido do repositório Microsoft com verificação de assinatura e checksum. A compilação não desativou TLS ou validação de pacotes.

Instalação de dependências com `npm ci` e sequência `npm run android:debug` repetidas com sucesso.

A proteção de assinatura foi verificada com `:app:assembleRelease --dry-run`: falha esperada por ausência de `android/keystore.properties`, com instrução explícita para configurar a chave local. Nenhum release foi gerado.
