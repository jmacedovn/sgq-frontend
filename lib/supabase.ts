/**
 * DEPRECATED: O sistema agora utiliza o PostgreSQL local via backend Express.
 * Use o serviço em 'lib/api.ts' para interagir com o banco de dados.
 */
export const supabase = {
  auth: {
    getUser: () => null,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      order: () => chain,
      limit: () => chain,
      single: () => chain,
      match: () => chain,
      neq: () => chain,
      then: (onSuccess: any) => Promise.resolve({ data: [], error: null }).then(onSuccess),
      catch: (onFail: any) => Promise.resolve({ data: [], error: null }).catch(onFail)
    };
    return chain as any;
  },
  channel: () => ({
    on: () => ({
      subscribe: () => ({ unsubscribe: () => {} })
    })
  }),
  removeChannel: () => {}
} as any;