const SAFE_USER_COLUMNS = ['id', 'firstName', 'lastName', 'email', 'userName', 'phoneNumber', 'gender'];
const UNIQUE_CONSTRAINT_MAP = {
    'users_username_unique': { field: 'userName', message: 'Username is already taken.' },
    'users_phonenumber_unique': { field: 'phoneNumber', message: 'Phone number is already registered.' },
    'users_email_unique': { field: 'email', message: 'Email address is already registered.' }
  };

module.exports = {
  SAFE_USER_COLUMNS,
  UNIQUE_CONSTRAINT_MAP
}