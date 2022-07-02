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

/* Get a single user from the database given their email. */
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

/* Get a single user from the database given their id. */
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

/* Add a new user to the database. */
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

/* Get all reservations for a single user. */
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

/* Get all properties. */
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
    queryString += `AND cost_per_night > $${queryParams.length}`;
    queryParams.push(options.maximum_price_per_night);
    queryString += `AND cost_per_night < $${queryParams.length}`;
  } 
  //if only max price is passed into query
  else if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    queryString += `AND cost_per_night > $${queryParams.length}`;
  }
  //if only max price is passed into query
  else if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    queryString += `AND cost_per_night < $${queryParams.length}`;
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

  return pool.query(queryString, queryParams).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;


/* Add a property to the database */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
