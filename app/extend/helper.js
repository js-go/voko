const bcrypt = require('bcryptjs');

exports.bcompare = (str, hash) => {
  return bcrypt.compareSync(str, hash);
};

exports.bhash = str => {
  return bcrypt.hashSync(str, 10);
};
