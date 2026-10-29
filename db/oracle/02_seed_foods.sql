-- =====================================================================
-- FlexiFit Oracle Foods Seed (02_seed_foods.sql)
-- ~60 Authentic foods with macros per 100g and regional descriptors
-- =====================================================================

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_matooke', 'Steamed Matooke', 'Amatooke agooke', 'carbohydrates', 122, 1.3, 31.0, 0.2, 200, 'g', 'UG', 'Central / Buganda', '2 fingers / 1 small heap (~200g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_posho', 'Posho (Maize Meal / Ugali)', 'Akawunga / Ugali', 'carbohydrates', 130, 2.7, 28.0, 0.6, 180, 'g', 'UG', 'East Africa', '1 medium fist (~180g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_kalo', 'Millet Bread (Kalo)', 'Akalo / Oburo', 'carbohydrates', 145, 3.5, 30.5, 1.1, 150, 'g', 'UG', 'Western / Northern Uganda', '1 palm scoop (~150g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_cassava_boiled', 'Boiled Cassava', 'Muwogo', 'carbohydrates', 160, 1.4, 38.0, 0.3, 150, 'g', 'UG', 'Eastern / Central Uganda', '2 root chunks (~150g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_sweet_potato', 'Steamed Sweet Potato', 'Lumonde', 'carbohydrates', 103, 1.6, 24.0, 0.2, 180, 'g', 'UG', 'Uganda', '1 medium potato (~180g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_irish_potato', 'Irish Potato (Boiled)', 'Obumonde obuzungu', 'carbohydrates', 87, 1.9, 20.0, 0.1, 180, 'g', 'UG', 'Kigezi / Western Uganda', '2 medium potatoes (~180g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_white_rice', 'White Rice (Cooked)', 'Omucere', 'carbohydrates', 130, 2.7, 28.2, 0.3, 150, 'g', 'UG', 'East Africa', '1 cupped bowl (~150g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_brown_rice', 'Brown Rice (Cooked)', 'Omucere omugumu', 'carbohydrates', 123, 2.7, 25.6, 1.0, 150, 'g', 'UG', 'East Africa', '1 cupped bowl (~150g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_porridge_maize', 'Maize Flour Porridge (No sugar)', 'Obushera bw’akawunga', 'carbohydrates', 62, 1.2, 13.5, 0.3, 250, 'ml', 'UG', 'Uganda', '1 enamel mug (~250ml)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_porridge_millet', 'Millet Fermented Porridge (Bushera)', 'Obushera bw’oburo', 'carbohydrates', 70, 1.8, 14.8, 0.5, 250, 'ml', 'UG', 'Western Uganda', '1 gourd / mug (~250ml)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_chapati', 'Ugandan Chapati (Pan-fried)', 'Kicapati', 'carbohydrates', 290, 7.0, 46.0, 9.0, 80, 'piece', 'UG', 'Kampala / Urban', '1 round chapati (~80g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_mandazi', 'Mandazi (Swahili Bun)', 'Amandazi', 'snacks_beverages', 320, 6.0, 52.0, 10.0, 60, 'piece', 'UG', 'East Africa', '1 triangle piece (~60g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_oats', 'Rolled Oats (Cooked with water)', 'Oats', 'carbohydrates', 71, 2.5, 12.0, 1.5, 200, 'g', 'UG', 'Urban', '1 breakfast bowl (~200g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_tilapia_boiled', 'Fresh Tilapia (Boiled / Stewed)', 'Ngege enfumbe', 'proteins', 96, 20.1, 0.0, 1.7, 150, 'g', 'UG', 'Lake Victoria', '1 palm-sized filet or half fish (~150g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_tilapia_fried', 'Whole Fried Tilapia', 'Ngege ensike', 'proteins', 165, 21.0, 0.0, 9.0, 180, 'g', 'UG', 'Kampala / Ggaba', '1 plate fish piece (~180g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_nile_perch', 'Nile Perch (Stewed)', 'Mputa', 'proteins', 118, 19.5, 0.0, 4.5, 160, 'g', 'UG', 'Lake Victoria', '1 thick steak cut (~160g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_mukene', 'Silverfish (Mukene / Dagaa, Pan-toasted)', 'Mukene', 'proteins', 210, 41.0, 0.0, 5.0, 40, 'g', 'UG', 'Lake Victoria', '2 tablespoons / small handful (~40g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_beans_stewed', 'Yellow / Red Beans (Stewed)', 'Ebijanjaalo', 'proteins', 115, 7.8, 19.5, 0.9, 160, 'g', 'UG', 'Uganda', '1 full ladle (~160g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_gnut_sauce', 'Groundnut Paste Sauce (G-nut sauce)', 'Ebinyebwa', 'proteins', 240, 10.5, 9.0, 19.0, 120, 'g', 'UG', 'Central / Buganda', '1 soup ladle (~120g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_gnut_raw', 'Roasted Groundnuts', 'Ebinyebwa ebisiike', 'fats_oils', 567, 25.8, 16.1, 49.2, 35, 'g', 'UG', 'Uganda', '1 small twist paper cone (~35g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_beef_lean_stew', 'Lean Beef Stew (Local Ankole beef)', 'Ennyama y’ente', 'proteins', 175, 24.5, 1.0, 8.0, 140, 'g', 'UG', 'Western Uganda', '3 palm-sized meat pieces (~140g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_goat_stew', 'Goat Meat Stew', 'Ennyama y’embuzi', 'proteins', 155, 22.0, 0.5, 7.0, 130, 'g', 'UG', 'Uganda', '3 pieces with bone (~130g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_chicken_local', 'Local Free-Range Chicken (Stewed)', 'Enkoko y’ekinnansi', 'proteins', 165, 26.0, 0.0, 6.5, 150, 'g', 'UG', 'Uganda', '1 chicken thigh or drumstick (~150g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_eggs_boiled', 'Whole Boiled Egg', 'Eggi effumbe', 'proteins', 155, 12.6, 1.1, 10.6, 50, 'egg', 'UG', 'Uganda', '1 medium egg (~50g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_milk_whole', 'Fresh Cow Milk (Boiled)', 'Amata amakalu', 'proteins', 62, 3.3, 4.8, 3.4, 250, 'ml', 'UG', 'Western / Ankole', '1 tea cup / glass (~250ml)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_dodo', 'Amaranth Greens (Dodo, Steamed)', 'Dodo', 'vegetables', 28, 3.2, 4.1, 0.4, 100, 'g', 'UG', 'Uganda', '1 generous fistful steamed (~100g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_sukuma', 'Sukuma Wiki (Collard Greens, sautéed)', 'Sukuma wiki', 'vegetables', 45, 2.9, 6.8, 1.4, 100, 'g', 'UG', 'East Africa', '1 large spoon heap (~100g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_cabbage', 'Steamed Cabbage with Tomatoes', 'Kabiji', 'vegetables', 25, 1.3, 5.8, 0.2, 120, 'g', 'UG', 'Uganda', '1 side cup (~120g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_avocado', 'Local Butter Avocado', 'Ovakkedo', 'fruits', 160, 2.0, 8.5, 14.7, 100, 'g', 'UG', 'Uganda', 'Half medium avocado (~100g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_rolex_single', 'Ugandan Rolex (1 Chapati + 2 Eggs)', 'Rolex ya chapati emu', 'mixed_dishes', 420, 17.5, 48.0, 18.0, 180, 'roll', 'UG', 'Kampala Street Food', '1 standard street roll (~180g)');

INSERT INTO flexi_foods (id, name, local_name, category, calories, protein_g, carbs_g, fat_g, typical_serving_g, serving_unit, country_code, region, portion_descriptor)
VALUES ('food_katogo_matooke_beans', 'Katogo (Matooke + Beans stewed)', 'Katogo k’ebijanjaalo', 'mixed_dishes', 140, 4.8, 28.5, 1.5, 300, 'g', 'UG', 'Uganda Breakfast', '1 full breakfast plate (~300g)');

COMMIT;
