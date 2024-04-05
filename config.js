/** Common config for bookstore. */


const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql://sw:jw8s0F5@localhost:5432/books_test"
  : "postgresql://sw:jw8s0F5@localhost:5432/books";


module.exports = { DB_URI };