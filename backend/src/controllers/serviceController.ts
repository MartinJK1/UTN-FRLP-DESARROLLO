import { Request, Response } from 'express';
import ServiceModel from '../models/Service';
import { CreateServiceRequest, UpdateServiceRequest } from '../types/service';
import { ServiceCategory } from '@prisma/client';

// CREATE - Crear un nuevo servicio
export const createService = async (req: Request, res: Response) => {
  try {
    // Extraer datos del body de la request
    const serviceData: CreateServiceRequest = req.body;
    
    // Validar que todos los campos requeridos estén presentes
    if (!serviceData.name || !serviceData.description || !serviceData.category || 
        serviceData.price === undefined || serviceData.duration === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos: name, description, category, price, duration'
      });
    }

    // Validar que el precio sea positivo
    if (serviceData.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser mayor a 0'
      });
    }

    // Validar que la duración sea positiva
    if (serviceData.duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La duración debe ser mayor a 0'
      });
    }

    // Validar que la categoría sea válida
    if (!Object.values(ServiceCategory).includes(serviceData.category)) {
      return res.status(400).json({
        success: false,
        message: `Categoría inválida. Use una de: ${Object.values(ServiceCategory).join(', ')}`
      });
    }

    // Crear el servicio usando el modelo
    const newService = await ServiceModel.create(serviceData);
    
    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: {
        service: newService
      }
    });

  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear el servicio'
    });
  }
};

// READ - Obtener todos los servicios
export const getAllServices = async (req: Request, res: Response) => {
  try {
    // Extraer parámetros de query
    const { onlyActive = 'true' } = req.query;
    
    // Convertir string a boolean
    const activeOnly = onlyActive === 'true';
    
    // Obtener servicios del modelo
    const services = await ServiceModel.findAll(activeOnly);
    
    // Respuesta exitosa
    res.json({
      success: true,
      data: {
        services,
        total: services.length,
        filters: {
          onlyActive: activeOnly
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener los servicios'
    });
  }
};

// READ - Obtener servicio por ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    // Extraer ID de los parámetros de la URL
    const serviceId = parseInt(req.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }
    
    // Buscar el servicio por ID
    const service = await ServiceModel.findById(serviceId);
    
    // Si no se encuentra el servicio
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    // Respuesta exitosa
    res.json({
      success: true,
      data: {
        service
      }
    });

  } catch (error) {
    console.error('Error al obtener servicio por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el servicio'
    });
  }
};

// READ - Obtener servicios por categoría
export const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    // Extraer categoría de los parámetros de la URL
    const { category } = req.params;
    
    // Validar que la categoría esté presente
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Categoría requerida'
      });
    }

    const categoryFilter = category.toUpperCase() as ServiceCategory;
    if (!Object.values(ServiceCategory).includes(categoryFilter)) {
      return res.status(400).json({
        success: false,
        message: `Categoría inválida. Use una de: ${Object.values(ServiceCategory).join(', ')}`
      });
    }
    
    // Obtener servicios por categoría
    const services = await ServiceModel.findByCategory(categoryFilter);
    
    // Respuesta exitosa
    res.json({
      success: true,
      data: {
        services,
        total: services.length,
        category
      }
    });

  } catch (error) {
    console.error('Error al obtener servicios por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener servicios por categoría'
    });
  }
};

// READ - Buscar servicios por término de búsqueda
export const searchServices = async (req: Request, res: Response) => {
  try {
    // Extraer término de búsqueda de los query parameters
    const { q: searchTerm } = req.query;
    
    // Validar que el término de búsqueda esté presente
    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Término de búsqueda requerido'
      });
    }
    
    // Validar que el término tenga al menos 2 caracteres
    if (searchTerm.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda debe tener al menos 2 caracteres'
      });
    }
    
    // Buscar servicios
    const services = await ServiceModel.searchServices(searchTerm);
    
    // Respuesta exitosa
    res.json({
      success: true,
      data: {
        services,
        total: services.length,
        searchTerm
      }
    });

  } catch (error) {
    console.error('Error al buscar servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al buscar servicios'
    });
  }
};

// UPDATE - Actualizar servicio existente
export const updateService = async (req: Request, res: Response) => {
  try {
    // Extraer ID y datos de actualización
    const serviceId = parseInt(req.params.id);
    const updateData: UpdateServiceRequest = req.body;
    
    // Validar que el ID sea un número válido
    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }
    
    // Validar que al menos un campo se proporcione para actualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos un campo para actualizar'
      });
    }
    
    // Validar precio si se proporciona
    if (updateData.price !== undefined && updateData.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser mayor a 0'
      });
    }
    
    // Validar duración si se proporciona
    if (updateData.duration !== undefined && updateData.duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La duración debe ser mayor a 0'
      });
    }
    
    // Validar categoría si se proporciona
    if (updateData.category) {
      if (!Object.values(ServiceCategory).includes(updateData.category)) {
        return res.status(400).json({
          success: false,
          message: `Categoría inválida. Use una de: ${Object.values(ServiceCategory).join(', ')}`
        });
      }
    }
    
    // Actualizar el servicio
    const updatedService = await ServiceModel.update(serviceId, updateData);
    
    // Si no se encuentra el servicio
    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: {
        service: updatedService
      }
    });

  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el servicio'
    });
  }
};

// DELETE - Eliminar servicio (soft delete)
export const deleteService = async (req: Request, res: Response) => {
  try {
    // Extraer ID del servicio
    const serviceId = parseInt(req.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }
    
    // Eliminar el servicio (soft delete)
    const deleted = await ServiceModel.delete(serviceId);
    
    // Si no se encuentra el servicio
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el servicio'
    });
  }
};

// DELETE - Eliminación física (hard delete)
export const hardDeleteService = async (req: Request, res: Response) => {
  try {
    // Extraer ID del servicio
    const serviceId = parseInt(req.params.id);
    
    // Validar que el ID sea un número válido
    if (isNaN(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }
    
    // Eliminar el servicio permanentemente
    const deleted = await ServiceModel.hardDelete(serviceId);
    
    // Si no se encuentra el servicio
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }
    
    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Servicio eliminado permanentemente'
    });

  } catch (error) {
    console.error('Error al eliminar servicio permanentemente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el servicio'
    });
  }
};

// ========================================
// OPERACIONES ESPECIALIZADAS
// ========================================

// READ - Obtener estadísticas de servicios
export const getServiceStats = async (req: Request, res: Response) => {
  try {
    // Obtener estadísticas del modelo
    const stats = await ServiceModel.getServiceStats();
    
    // Respuesta exitosa
    res.json({
      success: true,
      data: {
        stats
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas'
    });
  }
};
