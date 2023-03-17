const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");

app.use(cors());

require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const multer = require("multer");
const Joi = require("joi");

const port = process.env.PORT || 5000;

app.use(express.json());

// const schema = Joi.object({
//   firstName: Joi.string().min(2).max(25).required("Please enter First name"),
//   lastName: Joi.string().min(2).max(25).required("Please enter Last name"),
//   mobileNumber: Joi.number().required("Please enter Number"),
//   subject: Joi.string().required("Please enter Subject"),
//   message: Joi.string().min(50).max(300).required("Please enter Message"),
//   file: Joi.object(),
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage });

const uri =
  "mongodb+srv://tareq:y03apIIvGcprCOmt@cluster0.ywossa9.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const FormDataCollection = client.db("form").collection("contactRequest");
    //File Post with data

    
    app.post("/connect", upload.single("file"), function (req, res) {
      const file = req.file;
      const body = req.body;

      const addedData = {
        firstName: body?.firstName,
        lastName: body?.lastName,
        mobileNumber: body?.mobileNumber,
        subject: body?.subject,
        message: body?.message1,
        fileName: file?.filename,
      };
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "tarequl.islalm@gmail.com",
          pass: "oovoinogiijcyjmg",
        },
      });
      const mailOptions = {
        from: "sender@contactPage",
        subject: body?.subject,
        to: "tarequl.islalm@gmail.com",
        html: `<!DOCTYPE html>
        <html lang="en" >
        <head>
          <meta charset="UTF-8">
          <title>Contact Page</title>
          
        </head>
        <body>
        <!-- partial:index.partial.html -->
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
          <div style="margin:20px auto;">
            <div>
              <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"></a>
            </div>
            <p style="font-size:1.1em">Hi, I am ${body?.firstName}.</p>
            <p style="border-left: 2px solid gray; margin-left:10px; padding-left:5px">${body?.message1}</p>
           <div style="padding-top:5px;padding-bottom:5px">
           <p style="font-size:0.9em;">Regards</p>
           <p style="font-size:0.9em;font-weight:bold">${body?.firstName} ${body.lastName}</p>
           </div>
           
          </div>
        </div>
        <!-- partial -->
          
        </body>
        </html>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          return res.send(info.response);
        }
      });
      const result = FormDataCollection.insertOne(addedData);
      return res.send({ success: true, result });
    });

    //Get
    app.get("/contact", async (req, res) => {
      const contactRequest = await FormDataCollection.find().toArray();
      res.send(contactRequest);
    });
  } finally {
    //
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Form backend");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
