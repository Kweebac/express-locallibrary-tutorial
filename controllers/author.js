const Author = require("../models/author");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

// Display list of all Authors.
exports.author_list = async (req, res, next) => {
  try {
    const authors = await Author.find().sort({ family_name: 1 }).exec();

    res.render("author_list", {
      authors,
    });
  } catch (error) {
    return next(error);
  }
};

// Display detail page for a specific Author.
exports.author_detail = async (req, res, next) => {
  try {
    const [author, author_books] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({ author: req.params.id }, "title summary").exec(),
    ]);
    if (!author) {
      const error = new Error("Author not found");
      error.status = 404;
      return next(error);
    }

    res.render("author_detail", {
      author,
      author_books,
    });
  } catch (error) {
    return next(error);
  }
};

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
  res.render("author_form", {
    title: "Create Author",
    author: undefined,
    errors: [],
  });
};

// Handle Author create on POST.
exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  async (req, res, next) => {
    try {
      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render("author_form", {
          title: "Create Author",
          author: author,
          errors: errors.array(),
        });
      } else {
        await author.save();
        res.redirect(author.url);
      }
    } catch (error) {
      return next(error);
    }
  },
];

// Display Author delete form on GET.
exports.author_delete_get = async (req, res, next) => {
  try {
    const [author, author_books] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({ author: req.params.id }, "title summary").exec(),
    ]);

    if (author === null) res.redirect("/catalog/authors");

    res.render("author_delete", {
      author,
      author_books,
    });
  } catch (error) {
    return next(error);
  }
};

// Handle Author delete on POST.
exports.author_delete_post = async (req, res, next) => {
  try {
    const [author, author_books] = await Promise.all([
      Author.findById(req.params.id).exec(),
      Book.find({ author: req.params.id }, "title summary").exec(),
    ]);

    if (author_books.length > 0) {
      res.render("author_delete", {
        author,
        author_books,
      });
    } else {
      await Author.findByIdAndDelete(req.body.authorid);
      res.redirect("/catalog/authors");
    }
  } catch (error) {
    return next(error);
  }
};

// Display Author update form on GET.
exports.author_update_get = async (req, res, next) => {
  const author = await Author.findById(req.params.id).exec();

  res.render("author_form", {
    title: "Update Author",
    author,
    errors: [],
  });
};

// Handle Author update on POST.
exports.author_update_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  async (req, res, next) => {
    try {
      const author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render("author_form", {
          title: "Update Author",
          author: author,
          errors: errors.array(),
        });
      } else {
        const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, author);
        res.redirect(updatedAuthor.url);
      }
    } catch (error) {
      return next(error);
    }
  },
];
