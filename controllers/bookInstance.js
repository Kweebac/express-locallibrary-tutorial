const Book = require("../models/book");
const BookInstance = require("../models/bookInstance");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = async (req, res, next) => {
  try {
    const bookInstances = await BookInstance.find()
      .populate("book")
      .sort({ "book.title": 1 })
      .exec();

    console.log(bookInstances);
    res.render("bookinstance_list", {
      bookInstances,
    });
  } catch (error) {
    return next(error);
  }
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async (req, res, next) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id).populate("book").exec();
    if (bookInstance === null) {
      const err = new Error("Book copy not found");
      err.status = 404;
      return next(err);
    }

    res.render("bookInstance_detail", { bookInstance });
  } catch (error) {
    return next(error);
  }
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = async (req, res, next) => {
  try {
    const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

    res.render("bookInstance_form", {
      title: "Create BookInstance",
      book_list: allBooks,
      selected_book: undefined,
      errors: [],
      bookInstance: undefined,
    });
  } catch (error) {
    return next(error);
  }
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Invalid date").optional({ values: "falsy" }).isISO8601().toDate(),
  // check without .toDate() and with

  async (req, res, next) => {
    try {
      const bookInstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

        res.render("bookInstance_form", {
          title: "Create BookInstance",
          book_list: allBooks,
          selected_book: bookInstance.book._id,
          errors: errors.array(),
          bookInstance,
        });
      } else {
        await bookInstance.save();
        res.redirect(bookInstance.url);
      }
    } catch (error) {
      return next(error);
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = async (req, res, next) => {
  try {
    const bookInstance = await BookInstance.findById(req.params.id).exec();

    if (bookInstance === null) res.redirect("/catalog/bookinstances");

    res.render("bookInstance_delete", {
      bookInstance,
    });
  } catch (error) {
    return next(error);
  }
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = async (req, res, next) => {
  try {
    await BookInstance.findByIdAndDelete(req.body.bookInstanceId);
    res.redirect("/catalog/bookinstances");
  } catch (error) {
    return next(error);
  }
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = async (req, res, next) => {
  try {
    const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
    const bookInstance = await BookInstance.findById(req.params.id);

    res.render("bookInstance_form", {
      title: "Update BookInstance",
      book_list: allBooks,
      selected_book: bookInstance.book._id,
      errors: [],
      bookInstance: bookInstance,
    });
  } catch (error) {
    return next(error);
  }
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Invalid date").optional({ values: "falsy" }).isISO8601().toDate(),
  // check without .toDate() and with

  async (req, res, next) => {
    try {
      const bookInstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
        _id: req.params.id,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

        res.render("bookInstance_form", {
          title: "Update BookInstance",
          book_list: allBooks,
          selected_book: bookInstance.book._id,
          errors: errors.array(),
          bookInstance,
        });
      } else {
        const updatedBookInstance = await BookInstance.findByIdAndUpdate(
          req.params.id,
          bookInstance
        );
        res.redirect(updatedBookInstance.url);
      }
    } catch (error) {
      return next(error);
    }
  },
];
