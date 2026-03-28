const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  // Chamada da Etapa 1
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
};