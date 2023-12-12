const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const Genre = require("../models/genre");

// Display list of all Genre.
exports.genre_list = async (req, res, next) => {
  try {
    const genres = await Genre.find().sort({ name: 1 }).exec();

    res.render("genre_list", {
      genres,
    });
  } catch (error) {
    return next(error);
  }
};

// Display detail page for a specific Genre.
exports.genre_detail = async (req, res, next) => {
  try {
    const [genre, genre_books] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);
    if (!genre) {
      const error = new Error("Genre not found");
      error.status = 404;
      return next(error);
    }

    res.render("genre_detail", {
      genre,
      genre_books,
    });
  } catch (error) {
    return next(error);
  }
};

// Display Genre create form on GET.
exports.genre_create_get = async (req, res, next) => {
  res.render("genre_form", {
    title: "Create Genre",
    genre: undefined,
    errors: [],
  });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  async (req, res, next) => {
    try {
      const genre = new Genre({ name: req.body.name });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render("genre_form", {
          title: "Create Genre",
          genre: genre,
          errors: errors.array(),
        });
      } else {
        // uses collation to find documents with similar names (a, A, á etc.), if none exist a new document is created
        const genreExists = await Genre.findOne({ name: req.body.name })
          .collation({ locale: "en", strength: 2 })
          .exec();
        if (genreExists) {
          res.redirect(genreExists.url);
        } else {
          await genre.save();
          res.redirect(genre.url);
        }
      }
    } catch (error) {
      return next(error);
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = async (req, res, next) => {
  try {
    const [genre, genre_books] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);

    if (genre === null) res.redirect("/catalog/genres");

    res.render("genre_delete", {
      genre,
      genre_books,
    });
  } catch (error) {
    return next(error);
  }
};

// Handle Genre delete on POST.
exports.genre_delete_post = async (req, res, next) => {
  try {
    const [genre, genre_books] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);

    if (genre_books.length > 0) {
      res.render("genre_delete", {
        genre,
        genre_books,
      });
    } else {
      await Genre.findByIdAndDelete(req.body.genreid);
      res.redirect("/catalog/genres");
    }
  } catch (error) {
    return next(error);
  }
};

// Display Genre update form on GET.
exports.genre_update_get = async (req, res, next) => {
  try {
    const genre = await Genre.findById(req.params.id).exec();

    res.render("genre_form", {
      title: "Update Genre",
      genre,
      errors: [],
    });
  } catch (error) {
    return next(error);
  }
};

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  async (req, res, next) => {
    try {
      const genre = new Genre({
        name: req.body.name,
        _id: req.params.id,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render("genre_form", {
          title: "Update Genre",
          genre,
          errors: [],
        });
      } else {
        // uses collation to find documents with similar names (a, A, á etc.), if none exist a new document is created
        const genreExists = await Genre.findOne({ name: req.body.name })
          .collation({ locale: "en", strength: 2 })
          .exec();

        if (genreExists) {
          res.redirect(genreExists.url);
        } else {
          const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre);
          res.redirect(updatedGenre.url);
        }
      }
    } catch (error) {
      return next(error);
    }
  },
];
