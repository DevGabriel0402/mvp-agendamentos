import { collection, query, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Script para migrar documentos antigos (Serviços, Clientes, Agendamentos)
 * que não possuem o campo 'empresaId' para a empresa do Admin atual.
 */
export async function migrarDadosParaEmpresa(userId, empresaId) {
    console.log(`Iniciando migração para usuário ${userId} e empresa ${empresaId}...`);

    const colecoes = ['servicos', 'clientes', 'agendamentos'];
    let totalMigrado = 0;

    for (const nomeColecao of colecoes) {
        try {
            const q = query(collection(db, nomeColecao));
            const snap = await getDocs(q);

            for (const d of snap.docs) {
                const data = d.data();
                // Se não tem empresaId, migramos
                if (!data.empresaId || data.empresaId === 'undefined') {
                    try {
                        await updateDoc(doc(db, nomeColecao, d.id), {
                            empresaId: empresaId
                        });
                        totalMigrado++;
                        console.log(`Migrado [${nomeColecao}]: ${d.id}`);
                    } catch (updateErr) {
                        console.error(`Erro ao atualizar documento ${d.id} na coleção ${nomeColecao}:`, updateErr.message);
                    }
                }
            }
        } catch (collectionErr) {
            console.warn(`Aviso: Não foi possível listar a coleção '${nomeColecao}' para migração. Verifique as permissões ou se há documentos de outras empresas.`);
            console.error(collectionErr);
        }
    }

    if (totalMigrado > 0) {
        console.log(`Migração concluída! Total de documentos atualizados: ${totalMigrado}`);
    }
    return totalMigrado;
}
