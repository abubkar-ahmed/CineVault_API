const axios = require('axios');
const shuffleArray = require('../helpers/shuffleArray');
const imgURL = `https://image.tmdb.org/t/p/original`;
const BookMark = require('../model/BookMark');
const jwt = require('jsonwebtoken');
const User = require('../model/User')


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

const getAllData = async (req , res) => {

    try{
        const tvRes = await axios.get(`https://api.themoviedb.org/3/trending/tv/day?api_key=${process.env.API_KEY}`)

        const trendingTvSeries = await tvRes.data.results;

    
        const moviesRes = await axios.get(`https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.API_KEY}`)

        const trendingMovies = await moviesRes.data.results;
        
        


        const papularTvRes = await axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${process.env.API_KEY}
        `)

        const papularTv = await papularTvRes.data.results;

        const papularMovRes = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}
        `)

        const papularMov = await papularMovRes.data.results;

        const trending = [
            ...trendingTvSeries.map(e => {
                return {...e , backdrop_path : `${imgURL}${e.backdrop_path}` , poster_path : `${imgURL}${e.poster_path}`}
            }),
            ...trendingMovies.map(e => {
                return {...e , backdrop_path : `${imgURL}${e.backdrop_path}` , poster_path : `${imgURL}${e.poster_path}`}
            })
        ];

        const papular = [
            ...papularTv.map(e => {
                return {              
                    id: e.id,
                    title: e.title || e.name,
                    mediaType: e.mediaType,
                    poster: `${imgURL}${e.poster_path}`,
                    date: e.release_date
                    ? e?.release_date.split('-')[0]
                    : e?.first_air_date.split('-')[0],
                    lan: e.original_language,
                }
            }),
            ...papularMov.map(e => {
                return {              
                    id: e.id,
                    title: e.title || e.name,
                    mediaType: e.mediaType,
                    poster: `${imgURL}${e.poster_path}`,
                    date: e.release_date
                    ? e?.release_date.split('-')[0]
                    : e?.first_air_date.split('-')[0],
                    lan: e.original_language,}
            })
        ];

        const shuffledTrending = shuffleArray(trending);
        const shuffledPapular = shuffleArray(papular);
        

        return res.status(200).json({
            trending : shuffledTrending,
            papular : shuffledPapular
        });


    }catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }

}

const getMovies = async (req , res) => {
    const {page} = req.params;
    if(!page) return res.sendStatus(400);
    try{
        const moviesRes = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&page=${page}`)

        const movies = await moviesRes.data.results;
        const result = movies.map(e => {
            return {...e , backdrop_path : `${imgURL}${e.backdrop_path}` , poster_path : `${imgURL}${e.poster_path}` , original_name : e.original_title, date: e.release_date.split('-')[0]}
        });
        const shuffledResult = shuffleArray(result);

        return res.status(200).json({
            result : shuffledResult
        });
    }catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}


const getTv = async (req , res) => {
    const {page} = req.params;
    if(!page) return res.sendStatus(400);

    try{
        const tvRes = await axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.API_KEY}&page=${page}`)

        const tv = await tvRes.data.results;
        const result = tv.map(e => {
            return {...e , backdrop_path : `${imgURL}${e.backdrop_path}` , poster_path : `${imgURL}${e.poster_path}`,date: e.first_air_date.split('-')[0]}
        });
        const shuffledTv = shuffleArray(result);

        return res.status(200).json({
            result : shuffledTv
        });
    }catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }


}


const getRecomended = async (req, res) => {
    const currentUserEmail = await getCurrentUser(req, res);
    try {
      const user = await User.findOne({ email: currentUserEmail }).exec();
  
      if (!user) return res.sendStatus(500);
  
      const bookMarks = await BookMark.findOne({ userId: user._id });
      const media = bookMarks?.media;
      if (media?.length > 0) {
        const recommendations = await Promise.all(
          media.map(async (e) => {
            const { data } = await axios.get(
              `https://api.themoviedb.org/3/${e.mediaType}/${e.mediaId}/recommendations?api_key=${process.env.API_KEY}`
            );
            const recommendationList = data.results.map((result) => ({
              id: result.id,
              title: result.title || result.name,
              mediaType: e.mediaType,
              poster: `${imgURL}${result.poster_path}`,
              date: result.release_date
              ? result?.release_date.split('-')[0]
              : result?.first_air_date.split('-')[0],
              lan: result.original_language,
            }));

            return recommendationList;
          })
        );

        const shuffledResult = shuffleArray(recommendations.flat());
        const result = shuffledResult.length > 150 ? shuffledResult.slice(0,150) : shuffledResult ;

        return res.status(200).json(result);
      }
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
};
  

module.exports = {
    getAllData,
    getMovies,
    getTv,
    getRecomended
}