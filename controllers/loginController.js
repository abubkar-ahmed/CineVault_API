const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req , res) => {
    const {email , pwd} = req.body ;
    
    if(!email || !pwd ) return res.status(400).json({"message" : 'Email And Password Are Required'});

    const foundUser = await User.findOne({ email : email}).exec();

    if(!foundUser) return res.status(401).json({"message" : 'Bad Caredials'});

    const match = await bcrypt.compare(pwd , foundUser.password);

      

    try{
        if(match) {
            const accessToken = jwt.sign(
                {"email" : foundUser.email},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn : '50min'}
            )
            const refreshToken = jwt.sign(
                {"email" : foundUser.email},
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn : '1d'}
            )
    
            foundUser.refreshToken = refreshToken;
            const result = await foundUser.save();
    
           res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
            
            return res.json({ 
                id : result._id,
                email : result.email,
                image : result.userImgPath,
                accessToken : accessToken
             });
        } else {
            return res.status(401).json({"message" : 'Bad Caredials'})
        }
    }
    catch (err){
        console.log(err)
        return res.sendStatus(500);
    }
}


module.exports = { handleLogin }