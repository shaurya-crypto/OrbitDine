import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orbitdine.app',
  appName: 'OrbitDine',
  webDir: 'public',
  server: {
    url: 'https://orbit-dine-zeta.vercel.app',
    cleartext: true
  }
};

export default config;
