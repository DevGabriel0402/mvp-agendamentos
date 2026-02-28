import { db } from './src/firebase/config.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

async function setupSaaS() {
    const empresaId = 'empresa-teste-1';
    const adminUid = 'coloque-seu-uid-aqui'; // Você precisará rodar isso com um UID real logado

    console.log('Configurando Empresa...');
    await setDoc(doc(db, 'empresas', empresaId), {
        nome: 'Salão de Beleza VIP',
        slug: 'salao-vip',
        corTema: '#DDA7A5',
        logoUrl: '',
        createdAt: serverTimestamp(),
        plano: 'premium'
    });

    console.log('Vinculando Usuário à Empresa...');
    await setDoc(doc(db, 'usuarios', adminUid), {
        empresaId: empresaId,
        role: 'admin',
        updatedAt: serverTimestamp()
    });

    console.log('Pronto! Agora o login admin deve carregar esta empresa.');
}

// Para rodar, você pode chamar essa função temporariamente em algum useEffect ou via script Node (se tiver service account)
// No navegador: setupSaaS();
