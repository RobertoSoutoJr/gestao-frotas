import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Select } from './Select';
import { Input } from './Input';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';
import { EmptyState } from './EmptyState';
import { Badge } from './Badge';
import { Upload, FileText, Image, Trash2, Download, Eye, Plus, Paperclip, X } from 'lucide-react';
import { documentsService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';

const TIPOS_POR_ENTIDADE = {
  caminhao: ['CRLV', 'Seguro', 'Foto', 'Laudo', 'Outro'],
  motorista: ['CNH Frente', 'CNH Verso', 'Foto', 'Comprovante Residencia', 'Outro'],
  manutencao: ['Nota Fiscal', 'Foto Servico', 'Orcamento', 'Garantia', 'Outro'],
  viagem: ['Comprovante Entrega', 'Canhoto', 'CT-e', 'Nota Fiscal', 'Foto Carga', 'Outro'],
  estoque: ['Nota Fiscal', 'Comprovante Pagamento', 'Romaneio', 'Outro'],
};

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType) {
  return mimeType?.startsWith('image/');
}

export function DocumentGallery({ entidadeTipo, entidadeId, compact = false }) {
  const { success, error: showError } = useToast();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Upload form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const fileInputRef = useRef(null);

  const fetchDocs = async () => {
    if (!entidadeId) return;
    try {
      setLoading(true);
      const res = await documentsService.getByEntity(entidadeTipo, entidadeId);
      setDocs(res.data || []);
    } catch {
      // silently fail on load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, [entidadeTipo, entidadeId]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Erro', 'Arquivo excede 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !tipoDocumento) {
      showError('Validacao', 'Selecione o arquivo e o tipo de documento');
      return;
    }

    setUploading(true);
    try {
      await documentsService.upload(selectedFile, {
        entidade_tipo: entidadeTipo,
        entidade_id: entidadeId,
        tipo_documento: tipoDocumento,
        observacoes,
      });
      success('Sucesso!', 'Documento enviado');
      setShowUpload(false);
      setSelectedFile(null);
      setTipoDocumento('');
      setObservacoes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocs();
    } catch (err) {
      showError('Erro', err.message || 'Falha ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;
    setDeleteLoading(true);
    try {
      await documentsService.delete(deletingDoc.id);
      success('Sucesso!', 'Documento removido');
      setDeletingDoc(null);
      fetchDocs();
    } catch (err) {
      showError('Erro', err.message || 'Falha ao remover documento');
    } finally {
      setDeleteLoading(false);
    }
  };

  const tipos = TIPOS_POR_ENTIDADE[entidadeTipo] || ['Outro'];

  if (loading) {
    return (
      <div className="text-center py-4 text-sm text-[var(--color-text-secondary)]">
        Carregando documentos...
      </div>
    );
  }

  // Compact mode: just a count badge + button (for use inside entity cards)
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
          <Paperclip className="mr-1.5 h-3.5 w-3.5" />
          Docs {docs.length > 0 && <Badge variant="default" className="ml-1.5">{docs.length}</Badge>}
        </Button>

        <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Documentos" size="lg">
          <DocumentGalleryFull
            docs={docs}
            tipos={tipos}
            entidadeTipo={entidadeTipo}
            entidadeId={entidadeId}
            onRefresh={fetchDocs}
          />
        </Modal>
      </div>
    );
  }

  // Full mode
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Documentos ({docs.length})
        </h3>
        <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Enviar Documento
        </Button>
      </div>

      {docs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center">
          <Paperclip className="mx-auto h-8 w-8 text-[var(--color-text-secondary)] opacity-50" />
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Nenhum documento anexado</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowUpload(true)}>
            <Upload className="mr-1.5 h-4 w-4" /> Enviar primeiro documento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {docs.map(doc => (
            <DocCard key={doc.id} doc={doc} onPreview={() => setPreviewDoc(doc)} onDelete={() => setDeletingDoc(doc)} />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => { setShowUpload(false); setSelectedFile(null); }} title="Enviar Documento" size="md">
        <div className="space-y-4">
          <Select label="Tipo de Documento" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} required>
            <option value="">Selecione o tipo</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Arquivo</label>
            <div
              className="relative flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-colors hover:border-[var(--color-accent)]"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div className="flex items-center gap-3 text-sm">
                  {isImage(selectedFile.type) ? (
                    <Image className="h-5 w-5 text-blue-400" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-400" />
                  )}
                  <div>
                    <p className="font-medium text-[var(--color-text)]">{selectedFile.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    className="ml-2 rounded-full p-1 hover:bg-red-500/10"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  >
                    <X className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-[var(--color-text-secondary)] opacity-50" />
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Clique para selecionar</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">JPG, PNG, WebP ou PDF (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <Input
            label="Observacoes (opcional)"
            placeholder="Ex: Vencimento 12/2026"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowUpload(false); setSelectedFile(null); }}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpload} disabled={uploading || !selectedFile || !tipoDocumento}>
              {uploading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewDoc && (
        <Modal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} title={previewDoc.nome_original} size="xl">
          <div className="space-y-4">
            {isImage(previewDoc.mime_type) ? (
              <img
                src={previewDoc.arquivo_url}
                alt={previewDoc.nome_original}
                className="mx-auto max-h-[70vh] rounded-lg object-contain"
              />
            ) : (
              <iframe
                src={previewDoc.arquivo_url}
                title={previewDoc.nome_original}
                className="h-[70vh] w-full rounded-lg border border-[var(--color-border)]"
              />
            )}
            <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
              <div>
                <Badge variant="default">{previewDoc.tipo_documento}</Badge>
                <span className="ml-2">{formatFileSize(previewDoc.tamanho_bytes)}</span>
                {previewDoc.observacoes && <span className="ml-2">— {previewDoc.observacoes}</span>}
              </div>
              <a
                href={previewDoc.arquivo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[var(--color-accent)] hover:underline"
              >
                <Download className="h-4 w-4" /> Baixar
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleDelete}
        title="Remover Documento"
        description={`Tem certeza que deseja remover "${deletingDoc?.nome_original}"? O arquivo sera apagado permanentemente.`}
        confirmText="Remover"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}

// Standalone full gallery for use inside modals (compact mode)
function DocumentGalleryFull({ docs, tipos, entidadeTipo, entidadeId, onRefresh }) {
  const { success, error: showError } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    if (!selectedFile || !tipoDocumento) return;
    setUploading(true);
    try {
      await documentsService.upload(selectedFile, {
        entidade_tipo: entidadeTipo,
        entidade_id: entidadeId,
        tipo_documento: tipoDocumento,
      });
      success('Sucesso!', 'Documento enviado');
      setSelectedFile(null);
      setTipoDocumento('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onRefresh();
    } catch (err) {
      showError('Erro', err.message || 'Falha ao enviar');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;
    setDeleteLoading(true);
    try {
      await documentsService.delete(deletingDoc.id);
      success('Sucesso!', 'Removido');
      setDeletingDoc(null);
      onRefresh();
    } catch (err) {
      showError('Erro', err.message || 'Falha ao remover');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick upload bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] p-3">
        <div className="flex-1 min-w-[140px]">
          <Select label="Tipo" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
            <option value="">Tipo</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Arquivo</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="block w-full text-sm text-[var(--color-text-secondary)] file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--color-accent)]/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--color-accent)]"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
        </div>
        <Button variant="primary" size="sm" onClick={handleUpload} disabled={uploading || !selectedFile || !tipoDocumento}>
          <Upload className="mr-1.5 h-4 w-4" />
          {uploading ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>

      {/* Document list */}
      {docs.length === 0 ? (
        <EmptyState icon={Paperclip} title="Nenhum documento" description="Envie o primeiro documento acima" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {docs.map(doc => (
            <DocCard key={doc.id} doc={doc} onPreview={() => setPreviewDoc(doc)} onDelete={() => setDeletingDoc(doc)} />
          ))}
        </div>
      )}

      {/* Preview */}
      {previewDoc && (
        <Modal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} title={previewDoc.nome_original} size="xl">
          {isImage(previewDoc.mime_type) ? (
            <img src={previewDoc.arquivo_url} alt={previewDoc.nome_original} className="mx-auto max-h-[70vh] rounded-lg object-contain" />
          ) : (
            <iframe src={previewDoc.arquivo_url} title={previewDoc.nome_original} className="h-[70vh] w-full rounded-lg border border-[var(--color-border)]" />
          )}
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleDelete}
        title="Remover Documento"
        description={`Remover "${deletingDoc?.nome_original}"?`}
        confirmText="Remover"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}

// Individual document card
function DocCard({ doc, onPreview, onDelete }) {
  const isImg = isImage(doc.mime_type);

  return (
    <div className="group relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden transition-all hover:shadow-md">
      {/* Thumbnail / Icon area */}
      <div
        className="flex h-28 items-center justify-center bg-[var(--color-surface)] cursor-pointer"
        onClick={onPreview}
      >
        {isImg ? (
          <img src={doc.arquivo_url} alt={doc.nome_original} className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-10 w-10 text-red-400/60" />
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="truncate text-xs font-medium text-[var(--color-text)]" title={doc.nome_original}>
          {doc.nome_original}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <Badge variant="default" className="text-[9px]">{doc.tipo_documento}</Badge>
          <span className="text-[10px] text-[var(--color-text-secondary)]">{formatFileSize(doc.tamanho_bytes)}</span>
        </div>
      </div>

      {/* Actions overlay */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80 backdrop-blur-sm"
          onClick={onPreview}
          title="Visualizar"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <a
          href={doc.arquivo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80 backdrop-blur-sm"
          title="Baixar"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
        <button
          className="rounded-lg bg-red-600/80 p-1.5 text-white hover:bg-red-600 backdrop-blur-sm"
          onClick={onDelete}
          title="Remover"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
