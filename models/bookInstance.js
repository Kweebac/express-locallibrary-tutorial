const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date, default: Date.now },
});
BookInstanceSchema.virtual("url").get(function () {
  return `/catalog/bookinstance/${this._id}`;
});
BookInstanceSchema.virtual("due_back_formatted").get(function () {
  return `${this.due_back.getMonth()}/${this.due_back.getDate()}/${this.due_back.getFullYear()}`;
});
BookInstanceSchema.virtual("due_back_yyyy_mm_dd").get(function () {
  const year = `${this.due_back.getFullYear()}`;
  let month = `${this.due_back.getMonth() + 1}`;
  if (month.length < 2) month = `0${month}`;
  let day = `${this.due_back.getDate()}`;
  if (day.length < 2) day = `0${day}`;

  return `${year}-${month}-${day}`;
});

module.exports = mongoose.model("BookInstance", BookInstanceSchema);
