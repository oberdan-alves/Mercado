const {test,expect,chromium}=require('@playwright/test');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const legacy=path.resolve('mercado.txt');
async function add(page,name='Café & pão',qty='2',price='3.5'){
 await page.fill('#prod-el',name);await page.locator('.header').click();await page.fill('#qtd-el',qty);await page.fill('#prec-el',price);await page.click('#add-btn');
}
async function importText(page,text,accept=true){
 const dialogs=[];
 const handler=async d=>{dialogs.push(d.message());if(d.type()==='confirm'&&!accept)await d.dismiss();else await d.accept()};
 page.on('dialog',handler);
 await page.setInputFiles('#import-file',{name:'backup.txt',mimeType:'text/plain',buffer:Buffer.from(text,'utf8')});
 await expect.poll(()=>dialogs.length).toBeGreaterThan(0);
 // Aguarda o resultado final da leitura assíncrona.
 if(accept && !dialogs[0].startsWith('Arquivo TXT inválido')) await expect.poll(()=>dialogs.length).toBe(2);
 page.off('dialog',handler);return dialogs;
}
async function exported(page){
 const waiting=page.waitForEvent('download');await page.click('#share-btn');await page.click('#export-btn');const download=await waiting;
 expect(download.suggestedFilename()).toMatch(/^mercado-.*\.txt$/);
 return fs.readFile(await download.path(),'utf8');
}
const pageErrors=new WeakMap();
test.beforeEach(async({page})=>{pageErrors.set(page,[]);page.on('pageerror',e=>pageErrors.get(page).push(e.message));return page.goto('/');});
test.afterEach(async({page})=>{expect(pageErrors.get(page)).toEqual([])});
test('cadastro, maiúsculas, atualização, edição, busca e exclusões',async({page})=>{
 await add(page);await expect(page.locator('.item-name')).toHaveText('CAFÉ & PÃO');
 await expect(page.locator('#total-el')).toHaveText('7,00');
 await add(page,'café & pão','3','4');await expect(page.locator('.item-card')).toHaveCount(1);
 await page.click('.edit');await page.fill('#edit-qtd','4');await page.click('#edit-save');
 await expect(page.locator('#total-el')).toHaveText('16,00');
 await page.fill('#search-el','inexistente');await expect(page.locator('.item-card')).toHaveCount(0);
 await page.fill('#search-el','café');await expect(page.locator('.item-card')).toHaveCount(1);
 await page.click('.del');await expect(page.locator('#total-el')).toHaveText('0,00');
 await page.fill('#search-el','');await add(page);await page.click('.edit');await page.click('#edit-del');
 await expect(page.locator('.item-card')).toHaveCount(0);
});
test('zerar preserva autocomplete e confirmação pode ser cancelada',async({page})=>{
 await add(page);page.once('dialog',d=>d.dismiss());await page.click('#zero-btn');await expect(page.locator('.item-card')).toHaveCount(1);
 page.once('dialog',d=>d.accept());await page.click('#zero-btn');await expect(page.locator('.item-card')).toHaveCount(0);
 await page.fill('#prod-el','café');await page.locator('.sug-item').click();
 await expect(page.locator('#prod-el')).toHaveValue('CAFÉ & PÃO');await expect(page.locator('#prec-el')).toHaveValue('3.50');
});
test('importa TXT original e restaura backup',async({page})=>{
 await add(page);await importText(page,await fs.readFile(legacy,'utf8'));
 await expect(page.locator('.item-card')).toHaveCount(39);await expect(page.locator('#total-el')).toHaveText('1.003,21');
 page.once('dialog',d=>d.accept());await page.click('#restore-btn');await expect(page.locator('.item-card')).toHaveCount(1);
 await expect(page.locator('#total-el')).toHaveText('7,00');
});
test('exporta UTF-8, transfere entre dispositivos e preserva precisão, ordem e catálogo',async({page,browser})=>{
 await add(page,'maçã e açúcar','0.12345','12.34567');await add(page,'Água','1','2');
 // O catálogo também pode conter produtos que não estão mais na lista após zerar.
 await page.evaluate(()=>{catalog['só catálogo']={name:'Só catálogo',price:9.8765};saveData()});
 const expected=await page.evaluate(()=>({items,catalog}));const text=await exported(page);
 expect(text).toContain('MAÇÃ E AÇÚCAR: 0,12345 x 12,34567');
 const other=await browser.newContext();const p=await other.newPage();await p.goto('/');await add(p,'ANTERIOR');
 await importText(p,text);expect(await p.evaluate(()=>({items,catalog}))).toEqual(expected);
 await p.reload();expect(await p.evaluate(()=>({items,catalog}))).toEqual(expected);
 await other.close();
});
test('importa formato antigo, valores BR/EN e quantidade zero exportada',async({page})=>{
 await importText(page,'LISTA DE MERCADO\nMaçã\n Qtd: 2 | Preço: R$ 1.234,56 | Total: R$ 2.469,12\nÁgua: 1 x 1,234.56 = 1,234.56');
 await expect(page.locator('#total-el')).toHaveText('3.703,68');
 await page.click('.edit >> nth=0');await page.fill('#edit-qtd','0');await page.click('#edit-save');
 const before=await page.evaluate(()=>items);await importText(page,await exported(page));
 expect(await page.evaluate(()=>items)).toEqual(before);
});
test('arquivo inválido e importação cancelada não alteram dados',async({page})=>{
 await add(page);const before=await page.evaluate(()=>JSON.stringify({items,catalog}));
 for(const text of ['qualquer coisa','Arroz: 1 x 2 = 2\nlinha inválida','Arroz: -1 x 2','Arroz: 1..2 x 3','DATA: MERCADO_BACKUP_V1 {"version":1,"items":null}']){
  const messages=await importText(page,text);expect(messages[0]).toContain('Arquivo TXT inválido');
  expect(await page.evaluate(()=>JSON.stringify({items,catalog}))).toBe(before);
 }
 await importText(page,'Arroz: 1 x 2 = 2',false);expect(await page.evaluate(()=>JSON.stringify({items,catalog}))).toBe(before);
});
test('calculadora compara menor, maior, igual e limpa',async({page})=>{
 await page.click('#calc-open-btn');
 for(const [f,v] of [['preco1','10'],['preco2','20'],['qtd1','2'],['tam1','0,5']]){
  await page.click('#ct-'+f);await page.fill('#cmod-input',v);await page.click('#cmod-ok');
 }
 await page.click('#c-calcbtn');await expect(page.locator('#c-r1')).toHaveText('R$ 10,0000');await expect(page.locator('#c-verdict')).toContainText('MENOR');
 for(const [value,result] of [['20','IGUAL'],['30','MAIOR']]){await page.click('#ct-preco1');await page.fill('#cmod-input',value);await page.click('#cmod-ok');await page.click('#c-calcbtn');await expect(page.locator('#c-verdict')).toContainText(result)}
 await page.click('#c-clearbtn');await expect(page.locator('#cv-preco1')).toHaveText('—');await page.click('#c-backbtn2');
});
test('offline após abertura: cadastro, exportação e importação sem requisições externas',async({page,context})=>{
 const remote=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1'))remote.push(r.url())});
 await context.setOffline(true);await add(page,'coração');const text=await exported(page);await importText(page,text);
 await expect(page.locator('.item-name')).toHaveText('CORAÇÃO');expect(remote).toEqual([]);
});
test('integração nativa encaminha TXT completo e trata erro sem apagar dados',async({page})=>{
 await page.evaluate(()=>{window.MercadoNative={isNative:true,exportTxt:async(text,filename)=>{window.received={text,filename}}}});
 await add(page);await page.click('#share-btn');await page.click('#export-btn');expect(await page.evaluate(()=>window.received.text)).toContain('CAFÉ & PÃO');
 await page.evaluate(()=>window.MercadoNative.exportTxt=async()=>{throw Error('cancelado')});
 page.once('dialog',d=>d.accept());await page.click('#share-btn');await page.click('#export-btn');await expect(page.locator('.item-card')).toHaveCount(1);
});
test('persistência após fechar e reabrir navegador com perfil em disco',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'mercado-test-'));
 const options={headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})};
 let context;
 try{
  context=await chromium.launchPersistentContext(dir,options);let p=await context.newPage();await p.goto('http://127.0.0.1:8080');await add(p);await context.close();
  context=await chromium.launchPersistentContext(dir,options);p=await context.newPage();await p.goto('http://127.0.0.1:8080');await expect(p.locator('#total-el')).toHaveText('7,00');
 }finally{if(context)await context.close();await fs.rm(dir,{recursive:true,force:true})}
});
for(const width of [320,360,390])test(`layout e controles em ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:640});await add(page,'Produto de nome muito comprido com acentuação');
 await importText(page,'Arroz: 1 x 2 = 2');
 for(const selector of ['.topbar','.form-row','.item-card','.bottombar'])expect(await page.locator(selector).first().evaluate(e=>e.scrollWidth>e.clientWidth)).toBe(false);
 await page.click('#calc-open-btn');expect(await page.locator('.calc-body').evaluate(e=>e.scrollWidth>e.clientWidth)).toBe(false);
 await page.click('#c-backbtn2');await expect(page.locator('#add-btn')).toBeVisible();
});

test('mantém dados anteriores nas mesmas chaves sem migração',async({page})=>{
 const state={items:[{name:'Água antiga',qty:2,price:1.7}],catalog:{'água antiga':{name:'Água antiga',price:1.7}}};
 await page.evaluate(state=>{localStorage.setItem('mkt3_items',JSON.stringify(state.items));localStorage.setItem('mkt3_cat',JSON.stringify(state.catalog))},state);
 await page.reload();expect(await page.evaluate(()=>({items,catalog}))).toEqual(state);
 await expect(page.locator('#total-el')).toHaveText('3,40');
});
test('TXT novo é aceito pelo importador original preservado',async({page,browser})=>{
 await add(page,'açúcar','1.25','3.4567');const text=await exported(page);
 const context=await browser.newContext();const other=await context.newPage();
 await other.route('**/original.html',async route=>route.fulfill({contentType:'text/html',body:await fs.readFile('original/mercado (4).html','utf8')}));
 await other.goto('http://127.0.0.1:8080/original.html');await importText(other,text);
 expect(await other.evaluate(()=>items)).toEqual([{name:'AÇÚCAR',qty:1.25,price:3.4567}]);await context.close();
});
test('HTML direto abre e funciona offline sem servidor',async({page,context})=>{
 const {pathToFileURL}=require('node:url');await context.setOffline(true);
 try{await page.goto(pathToFileURL(path.resolve('mercado (4).html')).href);}catch(e){
  if(e.message.includes('ERR_BLOCKED_BY_ADMINISTRATOR'))test.skip(true,'A política do Chromium deste ambiente bloqueia file://; executar no computador local.');
  throw e;
 }
 await add(page,'Água');await expect(page.locator('#total-el')).toHaveText('7,00');
 const text=await exported(page);expect(text).toContain('ÁGUA');
});

test('compartilhamento de texto original continua disponível',async({page})=>{
 await add(page);await page.evaluate(()=>Object.defineProperty(navigator,'share',{value:async data=>{window.sharedText=data.text},configurable:true}));
 await page.click('#share-btn');await page.click('#share-text-btn');
 const text=await page.evaluate(()=>window.sharedText);expect(text).toContain('CAFÉ & PÃO: 2 x 3,5 = 7,00');expect(text).not.toContain('MERCADO_BACKUP_V1');
});
