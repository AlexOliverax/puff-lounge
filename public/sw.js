/* Service Worker mínimo do Puff & Lounge.
 * Necessário para o Android/Chrome oferecer a instalação do PWA.
 * Não faz cache: sempre busca a versão mais nova na rede. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {
  // Passa direto para a rede (comportamento padrão do navegador)
});
