import { useState, useCallback } from 'react';

/**
 * Hook for auto-filling address fields from a CEP (Brazilian zip code).
 * Uses the free ViaCEP API.
 *
 * Usage:
 *   const { lookupCep, loading: cepLoading } = useCepLookup((addressData) => {
 *     setFormData(prev => ({ ...prev, ...addressData }));
 *   });
 *
 *   <Input name="cep" onBlur={(e) => lookupCep(e.target.value)} />
 */
export function useCepLookup(onResult) {
  const [loading, setLoading] = useState(false);

  const lookupCep = useCallback(async (cep) => {
    // Remove non-digits
    const cleaned = (cep || '').replace(/\D/g, '');
    if (cleaned.length !== 8) return;

    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();

      if (data.erro) return;

      onResult({
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      });
    } catch {
      // Silent fail — user can fill manually
    } finally {
      setLoading(false);
    }
  }, [onResult]);

  return { lookupCep, loading };
}
