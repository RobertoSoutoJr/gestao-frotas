const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class TruckService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('caminhoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Falha ao buscar caminhões', 500, error);
    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('caminhoes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Caminhão não encontrado', 404, error);
    return data;
  }

  async create(truckData, userId) {
    // Check if license plate already exists for this user
    const { data: existing } = await supabase
      .from('caminhoes')
      .select('placa')
      .eq('placa', truckData.placa)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw new AppError('Placa já cadastrada', 409);
    }

    const { data, error } = await supabase
      .from('caminhoes')
      .insert([{ ...truckData, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar caminhão', 500, error);
    return data;
  }

  async update(id, truckData, userId) {
    const { data, error } = await supabase
      .from('caminhoes')
      .update(truckData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Falha ao atualizar caminhão', 500, error);
    return data;
  }

  async delete(id, userId) {
    const { error } = await supabase
      .from('caminhoes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError('Falha ao deletar caminhão', 500, error);
    return { message: 'Caminhão deletado com sucesso' };
  }

  async uploadFoto(id, file, userId) {
    // Verify ownership
    await this.getById(id, userId);

    const ext = file.originalname.split('.').pop() || 'jpg';
    const fileName = `trucks/${userId}/${id}_${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('fotos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw new AppError('Falha ao fazer upload da foto', 500, uploadError);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('fotos')
      .getPublicUrl(fileName);

    // Update truck with photo URL
    const { data, error } = await supabase
      .from('caminhoes')
      .update({ foto_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Falha ao atualizar caminhão com foto', 500, error);
    return data;
  }

  async updateMileage(id, newMileage, userId) {
    const truck = await this.getById(id, userId);

    if (newMileage < truck.km_atual) {
      throw new AppError('Nova quilometragem não pode ser menor que a atual', 400);
    }

    return this.update(id, { km_atual: newMileage }, userId);
  }
}

module.exports = new TruckService();
