
export const formatDocument = (value: string) => {
  const digits = value.replace(/\D/g, ''); 

  if (digits.length <= 11) {
    // Máscara de CPF: 000.000.000-00
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  } else {
    // Máscara de CNPJ: 00.000.000/0000-00
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }
};

export const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');

  // Máscara de Celular: (00) 00000-0000
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const formatCep = (value: string) => {
  const digits = value.replace(/\D/g, '');
  
  // Máscara de CEP: 00000-000
  return digits
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
};