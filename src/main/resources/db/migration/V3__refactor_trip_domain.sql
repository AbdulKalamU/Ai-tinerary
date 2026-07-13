-- Refactor travel_plans to support relational itinerary structure
ALTER TABLE travel_plans DROP COLUMN activities;
ALTER TABLE travel_plans DROP COLUMN ai_response;

-- Create itinerary_days table
CREATE TABLE itinerary_days (
    id BIGSERIAL PRIMARY KEY,
    travel_plan_id BIGINT NOT NULL,
    day_index INT NOT NULL,
    title VARCHAR(255),
    overview TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_itinerary_trip FOREIGN KEY (travel_plan_id) REFERENCES travel_plans (id) ON DELETE CASCADE
);

-- Create activities table
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    itinerary_day_id BIGINT NOT NULL,
    start_time TIME,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    location_data TEXT,
    estimated_cost VARCHAR(50),
    tips TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_activity_day FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days (id) ON DELETE CASCADE
);
