// server/src/routes/foods.js
// Food database search, filtering, and custom food creation

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/foods
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', country = '' } = req.query;
    const foods = await req.app.locals.db.getFoods(search, category, country);
    res.json({ foods, count: foods.length });
  } catch (err) {
    console.error('Get foods error:', err);
    res.status(500).json({ error: 'Failed to retrieve foods: ' + err.message });
  }
});

// GET /api/foods/:id
router.get('/:id', async (req, res) => {
  try {
    const food = await req.app.locals.db.getFoodById(req.params.id);
    if (!food) return res.status(404).json({ error: 'Food item not found.' });
    res.json({ food });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve food: ' + err.message });
  }
});

// POST /api/foods (Add custom food)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor } = req.body;

    if (!name || !category || calories == null) {
      return res.status(400).json({ error: 'Name, category, and calories are required.' });
    }

    const newFood = await req.app.locals.db.createFood({
      name,
      local_name,
      category,
      calories: Number(calories),
      protein_g: Number(protein_g || 0),
      carbs_g: Number(carbs_g || 0),
      fat_g: Number(fat_g || 0),
      typical_serving_g: Number(typical_serving_g || 100),
      serving_unit: serving_unit || 'g',
      country_code: country_code || req.user.country_code || 'UG',
      region: region || req.user.region || 'Kampala / Central',
      portion_descriptor: portion_descriptor || `${typical_serving_g || 100}g serving`,
      created_by: req.user.id,
    });

    res.status(201).json({ message: 'Custom food added', food: newFood });
  } catch (err) {
    console.error('Create food error:', err);
    res.status(500).json({ error: 'Failed to create food: ' + err.message });
  }
});

export default router;
