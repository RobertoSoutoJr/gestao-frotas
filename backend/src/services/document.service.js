const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class DocumentService {
  async getByEntity(entidadeTipo, entidadeId, userId) {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('user_id', userId)
      .eq('entidade_tipo', entidadeTipo)
      .eq('entidade_id', entidadeId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Falha ao buscar documentos', 500, error);
    return data;
  }

  async upload(file, metadata, userId) {
    const { entidade_tipo, entidade_id, tipo_documento, observacoes } = metadata;

    // Build unique file path
    const ext = file.originalname.split('.').pop();
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${entidade_tipo}/${entidade_id}/${timestamp}_${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) throw new AppError('Falha ao fazer upload do arquivo', 500, uploadError);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documentos')
      .getPublicUrl(filePath);

    // Save metadata to DB
    const { data, error } = await supabase
      .from('documentos')
      .insert({
        user_id: userId,
        entidade_tipo,
        entidade_id: Number(entidade_id),
        tipo_documento,
        nome_original: file.originalname,
        arquivo_url: urlData.publicUrl,
        arquivo_path: filePath,
        tamanho_bytes: file.size,
        mime_type: file.mimetype,
        observacoes: observacoes || null,
      })
      .select()
      .single();

    if (error) throw new AppError('Falha ao salvar documento', 500, error);
    return data;
  }

  async delete(id, userId) {
    // Get document first
    const { data: doc, error: fetchError } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !doc) throw new AppError('Documento não encontrado', 404);

    // Delete from Storage
    const { error: storageError } = await supabase.storage
      .from('documentos')
      .remove([doc.arquivo_path]);

    if (storageError) throw new AppError('Falha ao remover arquivo', 500, storageError);

    // Delete from DB
    const { error: dbError } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (dbError) throw new AppError('Falha ao deletar registro', 500, dbError);
    return { message: 'Documento removido com sucesso' };
  }

  async countByEntity(entidadeTipo, entidadeId, userId) {
    const { count, error } = await supabase
      .from('documentos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('entidade_tipo', entidadeTipo)
      .eq('entidade_id', entidadeId);

    if (error) throw new AppError('Falha ao contar documentos', 500, error);
    return count || 0;
  }
}

module.exports = new DocumentService();
