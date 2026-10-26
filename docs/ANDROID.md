# Gerar, instalar e atualizar o Mercado no Windows

## 1. Instalar ferramentas

1. Instale Git, Visual Studio Code e Node.js 24 LTS (https://nodejs.org).
2. Instale Android Studio estável (https://developer.android.com/studio).
3. No SDK Manager, instale Android SDK Platform 36, Android SDK Build-Tools 35.0.0, Android SDK Platform-Tools e Command-line Tools.
4. Use Java 21. Pode ser o JBR do Android Studio, se a versão for 21; caso contrário, instale um JDK 21 e selecione-o em Settings > Build Tools > Gradle > Gradle JDK. No terminal, `java -version` deve mostrar 21.
5. Para comandos no terminal, configure `JAVA_HOME` para o JDK e `ANDROID_HOME` para a pasta do SDK (normalmente `%LOCALAPPDATA%\Android\Sdk`). Alternativamente, o Android Studio cria `android/local.properties` com `sdk.dir=C:/Users/SEU_USUARIO/AppData/Local/Android/Sdk`. Esse arquivo é local e não vai para o Git.

Não é necessário instalar Gradle globalmente: o wrapper do projeto usa Gradle 8.14.3 com checksum fixado. A primeira compilação precisa de internet para baixar dependências. O aplicativo instalado funciona offline.

## 2. Abrir e editar no VS Code

```powershell
git clone https://github.com/oberdan-alves/Mercado.git
cd Mercado
code .
npm ci
npm run dev
```

Abra o endereço informado pelo servidor no computador. Edite `mercado (4).html`; reinicie `npm run dev` ou execute `npm run build` após alterações e recarregue a página. Para usar sem servidor, abra diretamente o HTML. Use sempre o mesmo endereço para acessar os mesmos dados locais.

## 3. Sincronizar e abrir no Android Studio

```powershell
npm run android:sync
npm run android:open
```

Aguarde o Gradle Sync. Abra um emulador ou conecte um celular com depuração USB. Run instala a versão debug. A interface é empacotada no APK; não configure `server.url`, live reload ou endereço de servidor na versão distribuída.

## 4. Gerar APK de teste

```powershell
npm run android:debug
```

Saída: `android/app/build/outputs/apk/debug/app-debug.apk`. Alternativamente, no Android Studio use Build > Generate App Bundles or APKs > Generate APKs (nomes podem variar por versão).

O APK debug é assinado com chave de desenvolvimento. Serve para testes; a chave pode variar entre computadores. Exporte os dados antes de migrar de debug para release: assinaturas diferentes impedem atualização direta.

## 5. Criar a chave definitiva e gerar release assinado

Crie a chave **uma única vez**, fora do repositório:

```powershell
keytool -genkeypair -v -keystore "$env:USERPROFILE\Chaves\mercado-release.jks" -alias mercado -keyalg RSA -keysize 3072 -validity 10000
```

Crie antes a pasta `Chaves`. Informe as senhas apenas no terminal local; guarde a chave e suas senhas com backup seguro. Sem a mesma chave não será possível instalar atualizações sobre a versão anterior.

Copie `android/keystore.properties.example` para `android/keystore.properties`, ajuste caminho, alias e senhas localmente. Os arquivos de chave e `keystore.properties` são ignorados pelo Git. Não os envie em chat, commits ou relatórios.

```powershell
npm run android:release
```

Saída: `android/app/build/outputs/apk/release/app-release.apk`. O comando falha se o arquivo de assinatura não existir. Alternativamente, use Build > Generate Signed Bundle / APK > APK no Android Studio e selecione a mesma chave definitiva.

## 6. Instalar no celular

Transfira o APK por cabo USB, arquivo compartilhado ou outro meio escolhido. Abra-o no gerenciador de arquivos do Android e permita a instalação dessa origem quando solicitado. Não precisa da Play Store.

Com ADB instalado e celular autorizado:

```powershell
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Para uso definitivo, instale o release assinado no lugar do APK debug. Se já houver uma versão com outra assinatura, exporte o TXT antes de desinstalar, instale o release e importe o backup.

## 7. Atualizar sem perder registros

1. Exporte um TXT como backup externo antes da atualização.
2. Edite o HTML. Em `android/app/build.gradle`, aumente `versionCode` (2, 3...) e atualize `versionName`.
3. Mantenha **o mesmo applicationId**, a mesma chave/alias de assinatura e a origem do WebView (`https://localhost` em `capacitor.config.json`).
4. Execute `npm run android:release` e instale o novo APK por cima do anterior, sem desinstalar. Com ADB, use `adb install -r caminho/do/novo.apk`.
5. Confirme que a lista e o catálogo continuam presentes.

O Android normalmente mantém os dados em atualização com mesma identidade e assinatura. Desinstalar, limpar dados ou trocar a origem do WebView pode apagar ou tornar inacessível o armazenamento. Não dependa do backup automático do sistema: use TXT. Navegador do computador e app Android têm armazenamentos separados; a primeira transferência exige exportar/importar.

## 8. Teste obrigatório no aparelho

- Em modo avião, abrir o app, cadastrar, editar, buscar, excluir e usar a calculadora.
- Fechar completamente e reabrir; conferir lista e catálogo.
- Exportar TXT; salvar pelo compartilhamento em um destino disponível e enviar ao computador.
- Importar o arquivo no computador; exportar de volta e importar no Android, conferindo acentos e valores fracionários.
- Cancelar importação; tentar arquivo inválido; conferir que nada mudou.
- Importar arquivo válido e usar Restaurar backup anterior à importação.
- Instalar uma segunda versão com `versionCode` maior e mesma assinatura por cima da primeira; conferir os registros.
- Conferir teclado, barras do sistema e seletor de arquivos na versão de Android usada.

Esses testes reais não são substituídos pelos testes de navegador ou pela compilação do APK.
