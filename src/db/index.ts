import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';

function createDb() {
  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      'TURSO_CONNECTION_URL nao esta definida. Configure as variaveis de ambiente ' +
        '(veja .env.example) antes de usar o banco.'
    );
  }

  // Um banco em arquivo (file:local.db) so existe na maquina de desenvolvimento.
  // Na Vercel o sistema de arquivos e efemero e somente leitura, entao toda query
  // falharia com um erro generico de query. Falhar aqui deixa a causa obvia.
  if (url.startsWith('file:') && process.env.VERCEL) {
    throw new Error(
      `TURSO_CONNECTION_URL esta apontando para "${url}", um arquivo local, mas a ` +
        'aplicacao esta rodando na Vercel. Use uma URL remota do Turso (libsql://...) ' +
        'e defina TURSO_AUTH_TOKEN nas variaveis de ambiente do projeto.'
    );
  }

  if (url.startsWith('libsql://') && !authToken) {
    throw new Error(
      'TURSO_AUTH_TOKEN nao esta definida, mas TURSO_CONNECTION_URL aponta para um ' +
        'banco Turso remoto.'
    );
  }

  return drizzle(createClient({ url, authToken }), { schema });
}

type Db = ReturnType<typeof createDb>;

let instance: Db | undefined;

// A conexao e criada na primeira consulta, e nao no import: assim o `next build`
// nao precisa das credenciais e a validacao acima roda em tempo de requisicao.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    instance ??= createDb();
    const value = Reflect.get(instance, prop);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export type Database = Db;
