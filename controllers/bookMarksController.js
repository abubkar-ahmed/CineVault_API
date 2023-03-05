const User = require('../model/User');
const BookMark = require('../model/BookMark');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const imgURL = `https://image.tmdb.org/t/p/original`;

const getCurrentUser = async (req , res) => {
    let currentUserEmail ;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.sendStatus(403);
            currentUserEmail = decoded.email ;
        }
    ); 
    return currentUserEmail ;
}

const getBookMarksDetails = async (req , res) => {
    const currentUserEmail = await getCurrentUser(req, res);

    try {
        const user = await User.findOne({email : currentUserEmail}).exec();

        if(!user) return res.sendStatus(500);
        
        const bookMarks = await BookMark.findOne({userId : user._id});

        const media = bookMarks?.media;
        if(media?.length > 0) {
            const mediaDetails = await Promise.all(media.map(async (e) => { 
              const { data } = await axios.get(`https://api.themoviedb.org/3/${e.mediaType}/${e.mediaId}?api_key=${process.env.API_KEY}&language={language}`);
              return {
                id: data.id,
                title: data.title || data.name,
                mediaType: e.mediaType,
                poster: `${imgURL}${data.poster_path}`,
                date: data.release_date ? data.release_date.slice(0, 4) : data.first_air_date.slice(0, 4),
                lan: data.original_language,
              };
            }));
    
            return res.status(200).json(mediaDetails);
        }
        return res.sendStatus(204);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
}


const getBookMarksIds = async (req, res) => {
    const currentUserEmail = await getCurrentUser(req, res);
    try{
        const user = await User.findOne({email : currentUserEmail}).exec();

        if(!user) return res.sendStatus(500);

        const bookMarks = await BookMark.findOne({userId : user._id});

        return res.status(200).json({media : bookMarks.media});

    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}

const addToBookMarks = async (req , res) => {
    const currentUserEmail = await getCurrentUser(req, res);

    const {bookMarkId , mediaType} = req.body ;

    if(!bookMarkId || !mediaType) return res.sendStatus(400) ;

    try{
        const user = await User.findOne({email : currentUserEmail}).exec();

        if(!user) return res.sendStatus(500);
        const bookMarks = await BookMark.findOne({userId : user._id});

        if(bookMarks){
            bookMarks.media.push({
                mediaId : bookMarkId,
                mediaType : mediaType
            });
            const result = await bookMarks.save();
            
            return res.status(201).json({
                media : result.media
            })
        }else{
            const newBookMarks = await BookMark.create({
                userId : user._id,
                media : [
                    {
                        mediaId : bookMarkId,
                        mediaType : mediaType
                    }
                ]
            })

            return res.status(201).json({
                media : newBookMarks.media
            });
        }

    }catch (err) {
        console.log(err);
        return res.sendStatus(500)
    }
}

const removeFromBookMarks = async (req, res) => {
    const currentUserEmail = await getCurrentUser(req, res);

    const {mediaId} = req.params;
    if(!mediaId) return res.sendStatus(400);

    try{
        const user = await User.findOne({email : currentUserEmail}).exec();

        if(!user) return res.sendStatus(500);

        const bookMarks = await BookMark.findOne({userId : user._id});

        if(bookMarks){
            const newMedia = bookMarks.media.filter(e => {
                return e.mediaId !== mediaId ;
            });
            
            bookMarks.media = newMedia;

            const result = await bookMarks.save();
            
            return res.status(201).json({media : result.media});
        }
        return res.sendStatus(400);

    }catch (err){
        console.log(err);
        return res.status(500);
    }
}


module.exports = {
    addToBookMarks ,
    getBookMarksIds ,
    removeFromBookMarks,
    getBookMarksDetails
}