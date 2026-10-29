-- =====================================================================
-- FlexiFit Oracle ORDS REST Module Definition (04_ords_rest.sql)
-- Run in APEX SQL Workshop > SQL Scripts
-- Enables REST endpoint module 'flexifit/v1' with custom SQL handlers
-- =====================================================================

BEGIN
  ORDS.ENABLE_SCHEMA(
    p_enabled             => TRUE,
    p_schema              => USER,
    p_url_mapping_type    => 'BASE_PATH',
    p_url_mapping_pattern => 'flexifit',
    p_auto_rest_auth      => FALSE
  );
  COMMIT;
END;
/

BEGIN
  ORDS.DEFINE_MODULE(
    p_module_name    => 'flexifit_api',
    p_base_path      => 'v1/',
    p_items_per_page => 50,
    p_status         => 'PUBLISHED',
    p_comments       => 'FlexiFit prototype API endpoints'
  );

  -- 1. GET /api/foods
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'flexifit_api',
    p_pattern     => 'foods'
  );

  ORDS.DEFINE_HANDLER(
    p_module_name => 'flexifit_api',
    p_pattern     => 'foods',
    p_method      => 'GET',
    p_source_type => ORDS.SOURCE_TYPE_COLLECTION_FEED,
    p_source      => 'SELECT * FROM flexi_foods ORDER BY name',
    p_comments    => 'List all foods'
  );

  -- 2. GET /api/trainer/clients (Custom SQL with compliance flags)
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'flexifit_api',
    p_pattern     => 'trainer/:trainer_id/clients'
  );

  ORDS.DEFINE_HANDLER(
    p_module_name => 'flexifit_api',
    p_pattern     => 'trainer/:trainer_id/clients',
    p_method      => 'GET',
    p_source_type => ORDS.SOURCE_TYPE_COLLECTION_FEED,
    p_source      => 'SELECT * FROM flexi_client_flags_v WHERE trainer_id = :trainer_id ORDER BY flag_status DESC, client_name ASC',
    p_comments    => 'Get trainer clients with compliance flags'
  );

  -- 3. GET /api/client/:client_id/today (Aggregated daily dashboard)
  ORDS.DEFINE_TEMPLATE(
    p_module_name => 'flexifit_api',
    p_pattern     => 'client/:client_id/today'
  );

  ORDS.DEFINE_HANDLER(
    p_module_name => 'flexifit_api',
    p_pattern     => 'client/:client_id/today',
    p_method      => 'GET',
    p_source_type => ORDS.SOURCE_TYPE_COLLECTION_FEED,
    p_source      => 'SELECT u.id, u.name, cp.target_calories, cp.target_protein_g, cp.target_carbs_g, cp.target_fat_g,
                            NVL((SELECT SUM(calories) FROM flexi_meal_logs WHERE client_id = :client_id AND TRUNC(logged_at) = TRUNC(SYSTIMESTAMP)), 0) AS today_calories,
                            NVL((SELECT SUM(protein_g) FROM flexi_meal_logs WHERE client_id = :client_id AND TRUNC(logged_at) = TRUNC(SYSTIMESTAMP)), 0) AS today_protein_g,
                            NVL((SELECT SUM(carbs_g) FROM flexi_meal_logs WHERE client_id = :client_id AND TRUNC(logged_at) = TRUNC(SYSTIMESTAMP)), 0) AS today_carbs_g,
                            NVL((SELECT SUM(fat_g) FROM flexi_meal_logs WHERE client_id = :client_id AND TRUNC(logged_at) = TRUNC(SYSTIMESTAMP)), 0) AS today_fat_g
                     FROM flexi_users u
                     JOIN flexi_client_profiles cp ON u.id = cp.user_id
                     WHERE u.id = :client_id',
    p_comments    => 'Client today macros and progress'
  );

  COMMIT;
END;
/
