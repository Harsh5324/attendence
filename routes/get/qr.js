const { createCanvas, loadImage } = require("@napi-rs/canvas");

const qr = async (req, resp) => {
  try {
    let { data, size, text } = req.query;

    size = parseInt(size);

    const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${
      size + "x" + size
    }&data=${data}&margin=${(size * 3) / 100}`;

    const backgroundImage = await loadImage(imageUrl);

    const extraHeight = size / 5;
    const canvas = createCanvas(
      backgroundImage.width,
      backgroundImage.height + extraHeight
    );
    const ctx = canvas.getContext("2d");

    ctx.drawImage(backgroundImage, 0, 0);

    ctx.fillStyle = "#333";
    ctx.fillRect(0, backgroundImage.height, backgroundImage.width, extraHeight);

    ctx.fillStyle = "#fff";
    ctx.font = `${size / 12}px Verdana`;
    ctx.textAlign = "center";
    ctx.fillText(
      text,
      backgroundImage.width / 2,
      backgroundImage.height + backgroundImage.height / 8
    );

    resp.setHeader("Content-Type", "image/png");
    resp.send(canvas.toBuffer("image/png"));
  } catch (err) {
    console.log("Error generating QR code:", err);
    resp.fail();
  }
};

module.exports = qr;
