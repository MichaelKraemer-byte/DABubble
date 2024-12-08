import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const firebaseConfig = {
  apiKey: "AIzaSyDb-pVaKkrN8VIjgtohsSoKoLzH1zLEsEg",
  authDomain: "dabubble-825b5.firebaseapp.com",
  projectId: "dabubble-825b5",
  storageBucket: "dabubble-825b5.firebasestorage.app",
  messagingSenderId: "957006891931",
  appId: "1:957006891931:web:e2508e03456a392f2b6f3e"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()), provideAnimationsAsync(), provideAnimationsAsync()]
};