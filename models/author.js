const mongoose = require("mongoose");

const AuthorSchema = mongoose.Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: Date,
  date_of_death: Date,
});
AuthorSchema.virtual("name").get(function () {
  return this.first_name && this.family_name ? `${this.first_name} ${this.family_name}` : "";
});
AuthorSchema.virtual("url").get(function () {
  return `/catalog/author/${this._id}`;
});
AuthorSchema.virtual("date_of_birth_formatted").get(function () {
  return this.date_of_birth
    ? `${this.date_of_birth.getMonth()}/${this.date_of_birth.getDate()}/${this.date_of_birth.getFullYear()}`
    : "?";
});
AuthorSchema.virtual("date_of_death_formatted").get(function () {
  return this.date_of_death
    ? `${this.date_of_death.getMonth()}/${this.date_of_death.getDate()}/${this.date_of_death.getFullYear()}`
    : "?";
});
AuthorSchema.virtual("lifespan").get(function () {
  return `${this.date_of_birth_formatted} - ${this.date_of_death_formatted}`;
});
AuthorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function () {
  const year = `${this.date_of_birth.getFullYear()}`;
  let month = `${this.date_of_birth.getMonth() + 1}`;
  if (month.length < 2) month = `0${month}`;
  let day = `${this.date_of_birth.getDate()}`;
  if (day.length < 2) day = `0${day}`;

  return `${year}-${month}-${day}`;
});
AuthorSchema.virtual("date_of_death_yyyy_mm_dd").get(function () {
  const year = `${this.date_of_death.getFullYear()}`;
  let month = `${this.date_of_death.getMonth() + 1}`;
  if (month.length < 2) month = `0${month}`;
  let day = `${this.date_of_death.getDate()}`;
  if (day.length < 2) day = `0${day}`;

  return `${year}-${month}-${day}`;
});

module.exports = mongoose.model("Author", AuthorSchema);
