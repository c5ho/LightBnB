const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: '',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/* Get a single user from the database given their email. 
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = (email) => {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      return result.rows[0];
      //return result
    })
    .catch((err) => {
      return err.message;
    })
}
exports.getUserWithEmail = getUserWithEmail;

/* Get a single user from the database given their id. 
* @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.*/
const getUserWithId = (id) => {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      return err.message;
    })
}
exports.getUserWithId = getUserWithId;

/* Add a new user to the database. 
* @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.*/
const addUser = (user) => {
  return pool
    .query(`INSERT INTO users (name, email, password) 
      VALUES ( $1, $2, $3) RETURNING *`, 
      [`${user.name}`, `${user.email}`, `${user.password}`])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      return err.message;
    })
}
exports.addUser = addUser;

/// Reservations

/* Get all reservations for a single user. 
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.*/
const getAllReservations = (guest_id, limit = 10) => {

  return pool
    .query(`SELECT properties.*
    FROM properties
    JOIN reservations ON reservations.property_id = properties.id
    JOIN property_reviews ON property_reviews.property_id = properties.id
    WHERE reservations.guest_id = $1
    GROUP BY reservations.id, properties.id
    ORDER BY reservations.start_date
    LIMIT $2`, [`${guest_id}`, limit])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      return err.message;
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

/* Get all properties. 
* @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.*/
const getAllProperties = (options, limit) => {
  
  //array to hold parameters for the query
  const queryParams = [];
  
  //start of query with before WHERE
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON property_id = properties.id
  `;

  //if "My Listings" is selected (owner_id is passed into query)
  if (options.owner_id) {
    queryString += `WHERE owner_id = ${options.owner_id} `;
  }
  
  //if city is passed into query
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }
  
  //if both min and max price is passed into query
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    queryString += ` AND cost_per_night > $${queryParams.length}`;
    queryParams.push(options.maximum_price_per_night);
    queryString += ` AND cost_per_night < $${queryParams.length}`;
  } 
  //if only max price is passed into query
  else if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    queryString += ` AND cost_per_night > $${queryParams.length}`;
  }
  //if only max price is passed into query
  else if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    queryString += ` AND cost_per_night < $${queryParams.length}`;
  }

  queryString += `
  GROUP BY properties.id`;

  //if minimum rating is passed into query
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `
    HAVING avg(property_reviews.rating) > $${queryParams.length}`;
  }

  //other query paramters after WHERE (or HAVING if present)
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length}`;

  return pool.query(queryString, queryParams).then((res) => res.rows)
  .catch((err) => {
    return err.message;
  });
};
exports.getAllProperties = getAllProperties;

/* Add a property to the database 
* @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.*/
const addProperty = (property) => {
 
  //array to hold parameters for the query from the passed in object
  const queryParams = [
    property.owner_id, 
    property.title, 
    property.description, 
    property.thumbnail_photo_url, 
    property.cover_photo_url, 
    property.cost_per_night, 
    property.parking_spaces, 
    property.number_of_bathrooms,
    property.number_of_bedrooms,
    property.country, 
    property.street, 
    property.city, 
    property.province, 
    property.post_code, 
  ];

  let queryString = `
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true) RETURNING *;`;
  
  return pool.query(queryString, queryParams).then((res) => res.rows)
  .catch((err) => {
    return err.message;
  });
};
exports.addProperty = addProperty;
