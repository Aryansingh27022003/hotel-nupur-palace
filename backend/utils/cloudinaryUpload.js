const cloudinary = require("./cloudinary");
const streamifier = require("streamifier");

module.exports = function uploadBuffer(
  buffer,
  folder,
  originalName,
  mimetype
) {
  return new Promise((resolve, reject) => {
    const isPdf = mimetype === "application/pdf";

    const extension = isPdf ? "pdf" : originalName.split(".").pop();

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isPdf ? "raw" : "image",
        public_id: originalName.replace(/\.[^/.]+$/, ""),
        format: extension,
        use_filename: true,
        unique_filename: false
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
