import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stouch.app',
  appName: 'STouch',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
