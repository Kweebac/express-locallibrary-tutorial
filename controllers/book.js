const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookInstance");
const { body, validationResult } = require("express-validator");

exports.index = async (req, res, next) => {
  try {
    const [numBooks, numBookInstances, numAvailableBookInstances, numAuthors, numGenres] =
      await Promise.all([
        Book.countDocuments().exec(),
        BookInstance.countDocuments().exec(),
        BookInstance.countDocuments({ status: "Available" }).exec(),
        Author.countDocuments().exec(),
        Genre.countDocuments().exec(),
      ]);

    res.render("index", {
      title: "Local Library Home",
      book_count: numBooks,
      book_instance_count: numBookInstances,
      book_instance_available_count: numAvailableBookInstances,
      author_count: numAuthors,
      genre_count: numGenres,
    });
  } catch (error) {
    return next(error);
  }
};

// Display list of all books.
exports.book_list = async (req, res, next) => {
  try {
    const books = await Book.find({}, "title author")
      .sort({ title: 1 })
      .populate("author")
      .exec();

    res.render("book_list", {
      books,
    });
  } catch (error) {
    return next(error);
  }
};

// Display detail page for a specific book.
exports.book_detail = async (req, res, next) => {
  try {
    const [book, books] = await Promise.all([
      Book.findById(req.params.id).populate("author genre").exec(),
      BookInstance.find({ book: req.params.id }).exec(),
    ]);
    if (!book) {
      const error = new Error("Book not found");
      error.status = 404;
      return next(error);
    }

    res.render("book_detail", {
      book,
      books,
    });
  } catch (error) {
    return next(error);
  }
};

// Display book create form on GET.
exports.book_create_get = async (req, res, next) => {
  try {
    const [allAuthors, allGenres] = await Promise.all([
      Author.find().sort({ family_name: 1 }).exec(),
      Genre.find().sort({ name: 1 }).exec(),
    ]);

    res.render("book_form", {
      title: "Create Book",
      authors: allAuthors,
      genres: allGenres,
      book: undefined,
      errors: [],
    });
  } catch (error) {
    return next(error);
  }
};

// Handle book create on POST.
exports.book_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  body("title", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("author", "Author must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  async (req, res, next) => {
    try {
      const book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const [allAuthors, allGenres] = await Promise.all([
          Author.find().sort({ family_name: 1 }).exec(),
          Genre.find().sort({ name: 1 }).exec(),
        ]);

        for (const genre of allGenres) {
          if (book.genre.includes(genre._id)) genre.checked = "true";
        }

        res.render("book_form", {
          title: "Create Book",
          authors: allAuthors,
          genres: allGenres,
          book: book,
          errors: errors.array(),
        });
      } else {
        await book.save();
        res.redirect(book.url);
      }
    } catch (error) {
      return next(error);
    }
  },
];

// Display book delete form on GET.
exports.book_delete_get = async (req, res, next) => {
  try {
    const [book, book_instances] = await Promise.all([
      Book.findById(req.params.id).exec(),
      BookInstance.find({ book: req.params.id }, "title summary").exec(),
    ]);

    if (book === null) res.redirect("/catalog/books");

    res.render("book_delete", {
      book,
      book_instances,
    });
  } catch (error) {
    return next(error);
  }
};

// Handle book delete on POST.
exports.book_delete_post = async (req, res, next) => {
  try {
    const [book, book_instances] = await Promise.all([
      Book.findById(req.params.id).exec(),
      BookInstance.find({ book: req.params.id }, "title summary").exec(),
    ]);

    if (book_instances.length > 0) {
      res.render("book_delete", {
        book,
        book_instances,
      });
    } else {
      await Book.findByIdAndDelete(req.body.bookid);
      res.redirect("/catalog/books");
    }
  } catch (error) {
    return next(error);
  }
};

// Display book update form on GET.
exports.book_update_get = async (req, res, next) => {
  try {
    const [book, authors, genres] = await Promise.all([
      Book.findById(req.params.id).populate("author genre").exec(),
      Author.find().sort({ family_name: 1 }).exec(),
      Genre.find().sort({ name: 1 }).exec(),
    ]);

    if (book === null) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }

    // Mark our selected genres as checked.
    for (const genre of genres) {
      for (const book_genre of book.genre) {
        if (genre._id.toString() === book_genre._id.toString()) {
          genre.checked = "true";
        }
      }
    }

    res.render("book_form", {
      title: "Update Book",
      authors,
      genres,
      book,
      errors: [],
    });
  } catch (error) {
    return next(error);
  }
};

// Handle book update on POST.
// Handle book update on POST.
exports.book_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  body("title", "Title must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("author", "Author must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("summary", "Summary must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  async (req, res, next) => {
    try {
      const book = new Book({
        title: req.body.title,
        author: req.body.author,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
        _id: req.params.id, // set ID to previous ID otherwise a new one will be assigned
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const [authors, genres] = await Promise.all([
          Author.find().sort({ family_name: 1 }).exec(),
          Genre.find().sort({ name: 1 }).exec(),
        ]);

        for (const genre of genres) {
          if (book.genre.indexOf(genre._id) > -1) {
            genre.checked = "true";
          }
        }

        res.render("book_form", {
          title: "Update Book",
          authors,
          genres,
          book,
          errors: errors.array(),
        });
      } else {
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, book);
        res.redirect(updatedBook.url);
      }
    } catch (error) {
      return next(error);
    }
  },
];
