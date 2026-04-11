require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    require('fs').writeFileSync('mongo-error.txt', 'Successfully connected!');
    process.exit(0);
  })
  .catch((e) => {
    require('fs').writeFileSync('mongo-error.txt', e.message + '\n' + e.stack);
    process.exit(1);
  });
