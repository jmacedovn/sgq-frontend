
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ATENÇÃO: Substitua as credenciais abaixo pelas fornecidas pelo Firebase Console
// No Firebase Console: Configurações do Projeto > Seus Aplicativos > Configuração do SDK
const firebaseConfig = {
  apiKey: "AIzaSy_SUAS_CHAVE_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:00000000000000"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
