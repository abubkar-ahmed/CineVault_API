const axios = require('axios');
const imgURL = `https://image.tmdb.org/t/p/original`;


const getDetails = async (req , res) => {
    const {type , id} = req.params;
    if(!type || !id) return res.sendStatus(400);

    const checkType = () => {
        if(type === 'tv'){
            return true;
        }else if(type === 'movie'){
            return true
        }
        return false;
    }
    const checkingType = checkType();

    if(!checkingType) return res.status(400).json({
        'message' : 'Please Submit Vailed type (tv or movie).'
    })

    try{
        const response = await axios.get(`https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.API_KEY}&language=en-US`);

        const castResponse = await axios.get(`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${process.env.API_KEY}`);

        function formatTime(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours} h ${mins} min`;
        }

        if(type === 'movie'){
            const details = {
                id : response.data.id,
                name : response.data.original_title,
                date : response.data.release_date,
                vote : response.data.vote_average,
                runTime : formatTime(response.data.runtime),
                homePage : response.data.homepage,
                country : response.data.production_countries.name,
                back_drop : `${imgURL}${response.data.backdrop_path}`,
                overview : response.data.overview,
                genres : response.data.genres.map(e => {
                    return e.name 
                }).join(', '),
                cast : castResponse.data.cast.map(e => {
                    return {
                        id:e.id,
                        name : e.name,
                        image : e.profile_path ? `${imgURL}${e?.profile_path}` : null
                    }
                }),
            }
            return res.status(200).json(details)
        }else{
            const details = {
                id : response.data.id,
                name : response.data.original_name,
                date : response.data.first_air_date,
                vote : response.data.vote_average,
                homePage : response.data.homepage,
                country : response.data.production_countries.name,
                back_drop : `${imgURL}${response.data.backdrop_path}`,
                overview : response.data.overview,
                seasons : response.data.seasons.map(e => {
                    return {
                        id : e.id,
                        air_date : e.air_date,
                        season_number : e.season_number,
                        episode_count : e.episode_count,
                    }
                }),
                genres : response.data.genres.map(e => {
                    return e.name 
                }).join(', '),
                cast : castResponse.data.cast.map(e => {
                    return {
                        id:e.id,
                        name : e.name,
                        image : e.profile_path ? `${imgURL}${e?.profile_path}` : null
                    }
                }),
            }
            return res.status(200).json(details)
        }
    }catch(err){
        console.log(err)
        return res.sendStatus(500);
    }
    
}


module.exports = {
    getDetails
}