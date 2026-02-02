// src/hooks/useCalculoSaldo.js
export const useCalculoSaldo = (formData) => {
  const COSTO_CURSO = 120.00; // Valor ejemplo del curso
  const totalAbonado = Number(formData.abono_1 || 0) + Number(formData.abono_2 || 0);
  const saldoCalculado = COSTO_CURSO - totalAbonado;
  
  return saldoCalculado;
};