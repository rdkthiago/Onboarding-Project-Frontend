const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  startRegistration: async (data: { name: string; email: string }) => {
    const response = await fetch(`${API_URL}/registration/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao iniciar cadastro');
    }
    
    return response.json();
  },

  verifyMfa: async (data: { email: string; code: string }) => {
    const response = await fetch(`${API_URL}/registration/verify-mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Código inválido');
    }
    
    return response.json();
  },

  updateDocument: async (id: string, document: string) => {
    const cleanDocument = document.replace(/\D/g, ''); 
    
    const response = await fetch(`${API_URL}/registration/${id}/document`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: cleanDocument }),
    });
    
    if (!response.ok) throw new Error((await response.json()).message);
    return response.json();
  },

  updateContact: async (id: string, phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    const response = await fetch(`${API_URL}/registration/${id}/contact`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: cleanPhone }),
    });
    
    if (!response.ok) throw new Error((await response.json()).message);
    return response.json();
  },

  updateAddress: async (id: string, data: { zipCode: string; number: string; complement?: string }) => {
    const cleanCep = data.zipCode.replace(/\D/g, '');
    
    const response = await fetch(`${API_URL}/registration/${id}/address`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        zipCode: cleanCep, 
        number: data.number, 
        complement: data.complement || '' 
      }),
    });
    
    if (!response.ok) throw new Error((await response.json()).message);
    return response.json();
  },
};