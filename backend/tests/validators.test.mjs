import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Auth validators
const { registerSchema, loginSchema, changePasswordSchema } = require('../src/validators/auth.validator');
// Trip validators
const { createTripSchema, finalizeTripSchema } = require('../src/validators/trip.validator');
// Trip cost validators
const { createTripCostSchema, updateTripCostSchema } = require('../src/validators/tripCost.validator');
// Fuel validator
const { createFuelRecordSchema } = require('../src/validators/fuel.validator');

// ========================
// Auth Validators
// ========================
describe('Auth Validators', () => {
  describe('registerSchema', () => {
    it('accepts valid registration', () => {
      const data = { nome: 'João Silva', email: 'joao@email.com', password: '123456' };
      expect(() => registerSchema.parse(data)).not.toThrow();
    });

    it('rejects short name', () => {
      expect(() => registerSchema.parse({ nome: 'Jo', email: 'joao@email.com', password: '123456' })).toThrow();
    });

    it('rejects invalid email', () => {
      expect(() => registerSchema.parse({ nome: 'João', email: 'not-an-email', password: '123456' })).toThrow();
    });

    it('rejects short password', () => {
      expect(() => registerSchema.parse({ nome: 'João', email: 'joao@email.com', password: '123' })).toThrow();
    });

    it('accepts optional empresa and telefone', () => {
      expect(() => registerSchema.parse({ nome: 'João', email: 'joao@email.com', password: '123456', empresa: 'ACME', telefone: '34999999999' })).not.toThrow();
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login', () => {
      expect(() => loginSchema.parse({ email: 'a@b.com', password: 'x' })).not.toThrow();
    });

    it('rejects empty password', () => {
      expect(() => loginSchema.parse({ email: 'a@b.com', password: '' })).toThrow();
    });
  });

  describe('changePasswordSchema', () => {
    it('accepts valid password change', () => {
      expect(() => changePasswordSchema.parse({ currentPassword: 'old123', newPassword: 'new123' })).not.toThrow();
    });

    it('rejects short new password', () => {
      expect(() => changePasswordSchema.parse({ currentPassword: 'old', newPassword: '12' })).toThrow();
    });
  });
});

// ========================
// Trip Validators
// ========================
describe('Trip Validators', () => {
  const validTrip = {
    fornecedor_id: 1, cliente_id: 2, caminhao_id: 3, motorista_id: 4,
    produto: 'Milho', quantidade_sacas: 500, preco_produto_saca: 80, preco_frete_saca: 2.50,
  };

  describe('createTripSchema', () => {
    it('accepts valid trip', () => {
      expect(() => createTripSchema.parse(validTrip)).not.toThrow();
    });

    it('rejects missing fornecedor_id', () => {
      expect(() => createTripSchema.parse({ ...validTrip, fornecedor_id: undefined })).toThrow();
    });

    it('rejects frete below R$0.50', () => {
      expect(() => createTripSchema.parse({ ...validTrip, preco_frete_saca: 0.10 })).toThrow();
    });

    it('rejects frete above R$10.00', () => {
      expect(() => createTripSchema.parse({ ...validTrip, preco_frete_saca: 15.00 })).toThrow();
    });

    it('accepts optional costs and defaults to 0', () => {
      const result = createTripSchema.parse(validTrip);
      expect(result.custo_combustivel).toBe(0);
      expect(result.custo_pedagio).toBe(0);
    });

    it('accepts coordinates', () => {
      const result = createTripSchema.parse({ ...validTrip, origem_lat: -19.0, origem_lng: -46.3 });
      expect(result.origem_lat).toBe(-19.0);
    });
  });

  describe('finalizeTripSchema', () => {
    it('accepts valid finalization', () => {
      expect(() => finalizeTripSchema.parse({ forma_pagamento: 'pix' })).not.toThrow();
    });

    it('rejects invalid payment method', () => {
      expect(() => finalizeTripSchema.parse({ forma_pagamento: 'bitcoin' })).toThrow();
    });

    it('accepts all valid payment methods', () => {
      ['dinheiro', 'pix', 'transferencia', 'boleto', 'cheque', 'cartao', 'a_prazo'].forEach(m => {
        expect(() => finalizeTripSchema.parse({ forma_pagamento: m })).not.toThrow();
      });
    });
  });
});

// ========================
// Trip Cost Validators
// ========================
describe('Trip Cost Validators', () => {
  describe('createTripCostSchema', () => {
    it('accepts valid cost', () => {
      expect(() => createTripCostSchema.parse({ viagem_id: 1, tipo: 'pedagio', valor: 25.50 })).not.toThrow();
    });

    it('rejects zero valor', () => {
      expect(() => createTripCostSchema.parse({ viagem_id: 1, tipo: 'pedagio', valor: 0 })).toThrow();
    });

    it('rejects negative valor', () => {
      expect(() => createTripCostSchema.parse({ viagem_id: 1, tipo: 'pedagio', valor: -10 })).toThrow();
    });

    it('rejects invalid tipo', () => {
      expect(() => createTripCostSchema.parse({ viagem_id: 1, tipo: 'invalido', valor: 10 })).toThrow();
    });

    it('accepts all valid tipos', () => {
      ['combustivel', 'pedagio', 'manutencao', 'alimentacao', 'hospedagem', 'multa', 'outros'].forEach(tipo => {
        expect(() => createTripCostSchema.parse({ viagem_id: 1, tipo, valor: 10 })).not.toThrow();
      });
    });
  });

  describe('updateTripCostSchema', () => {
    it('accepts partial update', () => {
      expect(() => updateTripCostSchema.parse({ valor: 30 })).not.toThrow();
    });

    it('accepts empty update', () => {
      expect(() => updateTripCostSchema.parse({})).not.toThrow();
    });
  });
});

// ========================
// Fuel Validator
// ========================
describe('Fuel Validators', () => {
  it('accepts valid fuel record', () => {
    expect(() => createFuelRecordSchema.parse({
      caminhao_id: 1, motorista_id: 2, litros: 200, valor_total: 1200, km_registro: 150000,
    })).not.toThrow();
  });

  it('rejects zero litros', () => {
    expect(() => createFuelRecordSchema.parse({
      caminhao_id: 1, motorista_id: 2, litros: 0, valor_total: 100, km_registro: 1000,
    })).toThrow();
  });
});
