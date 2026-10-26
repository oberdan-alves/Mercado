const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests', fullyParallel:true, workers:2,
 use:{baseURL:'http://127.0.0.1:8080',browserName:'chromium',
  launchOptions:process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}},
 webServer:{command:'node scripts/serve.mjs',port:8080,reuseExistingServer:!process.env.CI}
});
