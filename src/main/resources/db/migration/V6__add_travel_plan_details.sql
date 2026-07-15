ALTER TABLE travel_plans DROP COLUMN IF EXISTS group_type;
ALTER TABLE travel_plans ADD COLUMN budget_estimate TEXT;
ALTER TABLE travel_plans ADD COLUMN local_phrases TEXT;
ALTER TABLE travel_plans ADD COLUMN packing_tips TEXT;
ALTER TABLE travel_plans ADD COLUMN safety_tips TEXT;
ALTER TABLE travel_plans ADD COLUMN food_recommendations TEXT;
