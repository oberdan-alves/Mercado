import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
window.MercadoNative = {
  isNative: Capacitor.isNativePlatform(),
  async shareText(text) {
    await Share.share({ title: 'Lista de Mercado', text });
  },
  async exportTxt(text, filename) {
    const result = await Filesystem.writeFile({
      path: filename, data: text, directory: Directory.Cache, encoding: Encoding.UTF8
    });
    await Share.share({ title: 'Lista de Mercado', files: [result.uri], dialogTitle: 'Salvar ou compartilhar TXT' });
  }
};
