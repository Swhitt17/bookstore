process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");


let book_isbn;

beforeEach(async () => {
    const result = await db.query(
        `INSERT INTO
         books(isbn, amazon_url,author,language,pages,publisher,title,year)
         VALUES ('0385529245',
         'https://amazon.com/lamp',
         'Andrea Ray',
         'English',
         450,
         'Fisherman publishing',
         'A really cool title',
         2010)
         RETURNING isbn`);

         book_isbn = result.rows[0].isbn
});



describe("GET /books", () => {
    test("Gets a list with one book", async () => {
        const res = await request(app).get('/books');
        const books = res.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("title");
        expect(books[0]).toHaveProperty("pages");
        expect(res.statusCode).toBe(200);


    });
});


describe("GET /books/:isbn", () => {
    test("Gets a list with one book", async () => {
        const res = await request(app).get(`/books/${book_isbn}`);
        expect(res.body.book).toHaveProperty("title");
        expect(res.body.book.isbn).toBe(book_isbn);
        expect(res.statusCode).toBe(200);
    });
    test("Responds with 404 for invalid isbn", async () =>{
        const res = await request(app).get(`/books/0`);
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /books", () => {
    test("Creates a single book", async () => {
        const res = await request(app).post('/books').
        send({isbn: '4162513643',
         amazon_url: 'https://amazon.com/toaster',
         author: "Myron Ramos",
         language:'English',
         pages: 600,
         publisher: 'Igloo Publishing',
         title: 'Wow! Amazing Title!',
         year: 2011});
         expect(res.statusCode).toBe(201);
         expect(res.body.book).toHaveProperty("language");
    });
    test(" Prevents creating a book without a required property", async () => {
        const res = await request(app).post('/books').send({author: "Myron Ramos"});
        expect(res.statusCode).toBe(400);
    });


});



describe("PUT /books/:isbn", () => {
    test("Updates a book", async () => {
        const res = await request(app).put(`/books/${book_isbn}`).
        send({isbn: '4162513643',
         amazon_url: 'https://amazon.com/toaster',
         author: "Myron Ramos",
         language:'English',
         pages: 600,
         publisher: 'Igloo Publishing',
         title: 'Wow! Cool Title!',
         year: 2011});
         expect(res.body.book).toHaveProperty("author");
         expect(res.body.book.title).toBe('Wow! Cool Title!');
    });
    test(" Prevents updating a book with incorrect property", async () => {
        const res = await request(app).put(`/books/${book_isbn}`)
        .send({isbn: '4162513643',
         amazon_url: 'https://amazon.com/toaster',
          author: "Myron Ramos",
        language:'English',
         pages: 'abc',
          publisher: 'Igloo Publishing',
           title: 'Wow! Cool Title!',
            year: 2011});
        expect(res.statusCode).toBe(400);
    });
    test("Responds with 404 for invalid isbn", async () =>{
        const res = await request(app).get(`/books/0`);
        expect(res.statusCode).toBe(404);
    });

});

describe("DELETE /books/:isbn", () => {
    test("Deletes a  book", async () => {
        const res = await request(app).delete(`/books/${book_isbn}`);
        expect(res.body).toEqual({ message: "Book deleted" });
    });
});


afterEach(async () => {
    await db.query(`DELETE FROM books`);
})

afterAll(async () => {
    await db.end();
})
