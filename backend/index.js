const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
require('colour');
const morgan = require('morgan');
const multer = require('multer');

const postRouter = require('./routes/postRouter');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const path = require('path');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

dotenv.config();

//Checking if server running
app.get('/', (req, res) => {
  res.send('<h2> Hello from Server</h2>')
})

// app.use(bodyParser.json({ limit: '30mb', extended: true }));
// app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());
app.use('/image', express.static(path.join(__dirname, '/image')));

//  Multer
const fileStorage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, 'image');
  },
  filename: (req, res, cb) => {
    cb(null, req.body.name);
  },
});
const fileUpload = multer({ storage: fileStorage });
app.post('/api/v3/upload', fileUpload.single('file'), (req, res) => {
  res.status(200).json('File has been uploaded');
});

app.use('/api/v3/posts', postRouter);
app.use('/api/v3/users', authRouter, userRouter);
app.use('/api/v3/category', authRouter, userRouter);

const PORT = process.env.PORT || 4000;

//* connect to our database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`server running on PORT: ${PORT}`.blue))
  )
  .catch((error) => console.log(error.message));
  if (process.env.NODE_ENV === 'production') {
    // Set Static Folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    });
};
