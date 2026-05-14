-- Migration 011: Add oficina column to manutencoes
-- Run this in the Supabase SQL editor to enable the "oficina" field on the mobile app.

ALTER TABLE manutencoes ADD COLUMN IF NOT EXISTS oficina VARCHAR(200);
