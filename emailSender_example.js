const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "./.env") });
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function main() {
  const result = await sgMail.send({
    to: ["valeria.chyornaya@gmail.com"],
    from: process.env.SENDER_EMAIL,
    subject: "Hello SendGrid",
    html: "<button>Hello, it is massage from server</button>",
  });
  console.log("massage was sended");
}

main();
