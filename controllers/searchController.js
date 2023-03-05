const axios = require('axios');
const imgURL = `https://image.tmdb.org/t/p/original`;

const getSearch = async (req, res) => {
    const {query , pageCount} = req.params ;
    if(!query || !pageCount) return res.sendStatus(400);

    function isNumberOrString(value) {
        return !isNaN(value);
    }

    if(!isNumberOrString(pageCount)) return res.sendStatus(400);
    try{
        const {data} = await axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${process.env.API_KEY}&query=${query}&page=${pageCount}`);
        return res.json({
            page : data.page,
            pages : data.total_pages,
            total_results : data.total_results,
            results : data.results.map(e => {
                return {
                    id: e.id,
                    title: e.title || e.name,
                    mediaType: e.media_type,
                    poster: `${imgURL}${e.poster_path}`,
                    date: e.release_date ? e?.release_date?.split('-')[0]: e?.first_air_date?.split('-')[0] ,
                    lan: e.original_language,
                }
            })

        }) 
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
};

module.exports = {
    getSearch,
}