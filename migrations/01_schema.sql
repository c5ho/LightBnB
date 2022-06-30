-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS properties CASCADE;
-- DROP TABLE IF EXISTS reservations CASCADE;
-- DROP TABLE IF EXISTS property_reviews CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE properties (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_photo_url VARCHAR(255) NOT NULL,
  cover_photo_url VARCHAR(255) NOT NULL,
  cost_per_night INTEGER NOT NULL DEFAULT 0,
  parking_spaces INTEGER NOT NULL DEFAULT 0,
  number_of_bathrooms INTEGER NOT NULL DEFAULT 0,
  number_of_bedrooms INTEGER NOT NULL DEFAULT 0,

  country VARCHAR(255) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  post_code VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE property_reviews (
  id SERIAL PRIMARY KEY NOT NULL,
  guest_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL DEFAULT 0,
  message TEXT
);

-- The app will have users, properties, reservations, and property reviews.

-- A user will have a name, email address, and password.

-- A property will have a title, description, costpernight, parking_spaces, numberofbathrooms, and numberofbedrooms.

-- A property will need to have images associated with it, so for now we will store a url for a small thumbnail photo and a large cover photo.

-- A property will need address data associated with it including country, street, city, province, post_code

-- A property can either be active or not active depending on weather the owner is currently renting it out or not.

-- A property will have an owner which will be one of the registered users.

-- A reservation will have a start date and an end date

-- A reservation will be made by a guest, which will be a registered user, and will be associated with a single property

-- A property review will have a message and a rating from 1 to 5

-- A property review can be made by a guest and will be associated with a single reservation

-- A user can own many properties

-- A property belongs to one owner

-- A user can make many reservation

-- A reservation belongs to one guest

-- A property can be reviewed by many guests