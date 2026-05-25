import { useState, useCallback } from 'react';

/**
 * Hook for auto-filling address fields from a CEP (Brazilian zip code).
 * Uses the free ViaCEP API. Falls back to city-only fill for generic CEPs.
 *
 * Usage:
 *   const { lookupCep, loading: cepLoading, error: cepError } = useCepLookup((addressData) => {
 *     setFormData(prev => ({ ...prev, ...addressData }));
 *   });
 *
 *   <Input name="cep" onBlur={(e) => lookupCep(e.target.value)} />
 */
export function useCepLookup(onResult) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookupCep = useCallback(async (cep) => {
    // Remove non-digits
    const cleaned = (cep || '').replace(/\D/g, '');
    if (cleaned.length !== 8) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();

      if (data.erro) {
        // Generic CEPs (ending in 000) are city-level and won't have street info.
        // Try to at least fill state based on the first 2 digits (faixa de CEP)
        const cityData = getCityFromCepRange(cleaned);
        if (cityData) {
          onResult({ endereco: '', bairro: '', ...cityData });
          setError('CEP genérico — cidade preenchida, complete o endereço manualmente.');
        } else {
          setError('CEP não encontrado. Verifique o número.');
        }
        return;
      }

      onResult({
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      });
    } catch {
      setError('Falha na consulta do CEP. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [onResult]);

  return { lookupCep, loading, error };
}

/**
 * Maps CEP first-two-digit ranges to UF.
 * This lets us at least fill the state for generic CEPs.
 */
function getCityFromCepRange(cep) {
  const prefix = parseInt(cep.substring(0, 2), 10);
  const ranges = [
    [[1, 19], 'SP'], [[20, 28], 'RJ'], [[29, 29], 'ES'],
    [[30, 39], 'MG'], [[40, 48], 'BA'], [[49, 49], 'SE'],
    [[50, 56], 'PE'], [[57, 57], 'AL'], [[58, 58], 'PB'],
    [[59, 59], 'RN'], [[60, 63], 'CE'], [[64, 64], 'PI'],
    [[65, 65], 'MA'], [[66, 68], 'PA'], [[69, 69], 'AM'],
    [[70, 73], 'DF'], [[74, 76], 'GO'], [[77, 77], 'TO'],
    [[78, 78], 'MT'], [[79, 79], 'MS'], [[80, 87], 'PR'],
    [[88, 89], 'SC'], [[90, 99], 'RS'],
  ];
  for (const [[min, max], uf] of ranges) {
    if (prefix >= min && prefix <= max) {
      return { estado: uf, cidade: '' };
    }
  }
  return null;
}
