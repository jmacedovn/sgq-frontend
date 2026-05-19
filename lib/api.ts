const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3002/api`;

export const api = {
  async getAllRecords() {
    const res = await fetch(`${API_URL}/view_all_records`);
    if (!res.ok) throw new Error(`Erro ao buscar registros: ${res.statusText}`);
    return res.json();
  },

  async getRecords(table: string, queryParams: any = {}) {
    const query = new URLSearchParams();
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
        query.append(key, queryParams[key]);
      }
    });
    
    const queryString = query.toString();
    const url = queryString ? `${API_URL}/${table}?${queryString}` : `${API_URL}/${table}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`Erro na API (${table}):`, errorData);
      throw new Error(errorData.details || errorData.error || res.statusText);
    }
    return res.json();
  },

  async insertRecord(table: string, payload: any) {
    const res = await fetch(`${API_URL}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`Erro ao inserir na tabela ${table}:`, errorData);
      throw new Error(errorData.details || errorData.error || res.statusText);
    }
    return res.json();
  },

  async updateRecord(table: string, id: string, payload: any) {
    const res = await fetch(`${API_URL}/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`Erro ao atualizar na tabela ${table}:`, errorData);
      throw new Error(errorData.details || errorData.error || res.statusText);
    }
    return res.json();
  },

  async deleteRecord(table: string, id: string) {
    const res = await fetch(`${API_URL}/${table}/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Erro ao deletar da tabela ${table}: ${res.statusText}`);
    return res.json();
  },
  
  async deleteAllRecords(table: string) {
    const res = await fetch(`${API_URL}/${table}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`Erro ao limpar a tabela ${table}: ${res.statusText}`);
    return res.json();
  }
};
