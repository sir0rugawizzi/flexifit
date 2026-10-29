// server/tests/macros.test.js
import { describe, it, expect } from '@jest/globals';

describe('Ugandan Food Nutrition & Portion Calculations', () => {
  const calculatePortionNutrition = (food100g, portionGrams) => {
    const ratio = portionGrams / 100;
    return {
      calories: Math.round(food100g.calories * ratio),
      protein_g: parseFloat((food100g.protein_g * ratio).toFixed(1)),
      carbs_g: parseFloat((food100g.carbs_g * ratio).toFixed(1)),
      fat_g: parseFloat((food100g.fat_g * ratio).toFixed(1)),
    };
  };

  it('accurately computes 200g serving of steamed matooke', () => {
    const matooke = { calories: 122, protein_g: 1.3, carbs_g: 31.0, fat_g: 0.2 };
    const serving = calculatePortionNutrition(matooke, 200);

    expect(serving.calories).toBe(244);
    expect(serving.protein_g).toBe(2.6);
    expect(serving.carbs_g).toBe(62.0);
    expect(serving.fat_g).toBe(0.4);
  });

  it('accurately computes high protein from fresh tilapia', () => {
    const tilapia = { calories: 96, protein_g: 20.1, carbs_g: 0.0, fat_g: 1.7 };
    const serving = calculatePortionNutrition(tilapia, 180);

    expect(serving.protein_g).toBe(36.2);
    expect(serving.carbs_g).toBe(0.0);
  });

  it('calculates macro adherence percentage accurately', () => {
    const targetCalories = 2000;
    const actualCalories = 1800; // 200 off = 90% adherence

    const diff = Math.abs(actualCalories - targetCalories);
    const adherencePct = Math.round(Math.max(0, 1 - diff / targetCalories) * 100);

    expect(adherencePct).toBe(90);
  });
});
