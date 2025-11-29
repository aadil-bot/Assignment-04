
require('dotenv').config();

module.exports = {
  "URI": process.env.MONGO_URI || "mongodb://localhost/Assignment-Planner"
}
