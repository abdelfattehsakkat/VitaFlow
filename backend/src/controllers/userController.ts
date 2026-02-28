import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all users avec pagination et recherche
 */
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query: any = {};
    if (search) {
      const searchStr = String(search).trim();
      query.$or = [
        { nom: { $regex: searchStr, $options: 'i' } },
        { prenom: { $regex: searchStr, $options: 'i' } },
        { email: { $regex: searchStr, $options: 'i' } },
        { telephone: { $regex: searchStr, $options: 'i' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshTokens')
        .sort({ [String(sortBy)]: sortDirection })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get user by ID
 */
export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create new user
 */
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      email, 
      password,
      nom, 
      prenom, 
      role,
      telephone,
      isActive = true
    } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Valider le role
    if (!['admin', 'medecin', 'assistant'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide. Doit être admin, medecin ou assistant'
      });
    }
    
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      nom,
      prenom,
      role,
      telephone,
      isActive
    });
    
    // Retourner sans mot de passe
    const { password: _, refreshTokens: __, ...userResponse } = user.toObject();
    
    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'Utilisateur créé avec succès'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update user
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      email, 
      nom, 
      prenom, 
      role,
      telephone,
      isActive,
      password
    } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Ne pas permettre de modifier son propre rôle
    if (req.user?.userId === id && role && role !== user.role) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre rôle'
      });
    }
    
    // Ne pas permettre de se désactiver soi-même
    if (req.user?.userId === id && isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas vous désactiver vous-même'
      });
    }
    
    // Vérifier l'unicité de l'email si modifié
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
      user.email = email.toLowerCase();
    }
    
    // Mettre à jour les champs
    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (role && ['admin', 'medecin', 'assistant'].includes(role)) user.role = role;
    if (telephone !== undefined) user.telephone = telephone;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Mettre à jour le mot de passe si fourni
    if (password && password.trim().length >= 8) {
      user.password = password;
    }
    
    await user.save();
    
    // Retourner sans données sensibles
    const { password: _, refreshTokens: __, ...userResponse } = user.toObject();
    
    res.json({
      success: true,
      data: userResponse,
      message: 'Utilisateur mis à jour avec succès'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Ne pas permettre de se supprimer soi-même
    if (req.user?.userId === id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
