require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const credintials = require('./middleware/credintials');
const corsOptions = require('./config/corsOptions');
const upload = require('express-fileupload');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500 ;

connectDB();

app.use(credintials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

app.use(upload());

// Routes

// Fetch Data Routes
app.use('/data' , require('./routes/getData'));
app.use('/details' , require('./routes/moreDetails'));
app.use('/search' , require('./routes/search'));

// Auth Routes
app.use('/register' , require('./routes/register'));
app.use('/login' , require('./routes/login'));
app.use('/logout' , require('./routes/logout'));
app.use('/refresh' , require('./routes/refresh'));

// Bookmarks
app.use('/bookMarks' , require('./routes/bookMarks'))





mongoose.connection.once('open' , () => {
    console.log('connect to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})