const dayjs = require("dayjs");

class Document {
  constructor(
    idDocument,
    title,
    scale,
    issuance_Date,
    language,
    pages,
    description,
    idtype,
    idlocation
  ) {
    this.idDocument = idDocument; // id of the document
    this.title = title;
    this.scale = scale;
    this.issuance_Date = dayjs(issuance_Date).format("MM/YYYY"); // format to display in the cards
    this.language = language;
    this.pages = pages;
    this.description = description;
    this.idtype = idtype; // type of document
    this.idlocation = idlocation; // location of the document id
  }
}

module.exports = Document;
